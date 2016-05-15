/*jshint node: true*/

/* udp-helper.js */
/* Module to help sending and receiving data via udp */

"use strict";

var exports = module.exports = {};
var paxos = module.exports.paxos = {};

var methodList = {};

exports.process = function(data, remote, client){

	var message = JSON.parse(data);
	var method = message.method || paxos.state;

	var response = methodList[method](message, client);

	if(response){
		var json = JSON.stringify(response);
		client.udpHelper.sendMessage(json, remote.port, remote.address, client.udp);
	}
};

exports.sendMessage = function(string, port, host, udp){
	var message = new Buffer(string);

	udp.send(message, 0, message.length, port, host, function(err) {
	    if (err) throw err;
	    console.log('UDP message sent to ' + host +':'+ port + " " + message);
	});
};

exports.getUdpInfo = function(playerId, clientList){
	var info = {};
	for(var i=0; i< clientList.length; i++){
		if(clientList[i].player_id == playerId){
			info.address = clientList[i].address;
			info.port = clientList[i].port;

			return info;
		}
	}
};

// For selecting leader in a round
exports.startPaxos = function(clientList, client){

	paxos.isKpuSelected = false;
	paxos.isProposer = false;
	paxos.proposalId = 0;

	if(clientList[clientList.length-1].username === client.username || 
		clientList[clientList.length-2].username === client.username){
		paxos.isProposer = true;
	}

	if(paxos.isProposer){
		exports.sendProposal(clientList, client);
	}
};

exports.sendProposal = function(clientList, client){

	if(paxos.isKpuSelected)
		return;

	paxos.promiseCount = 0;
	paxos.previousAccepted = {};

	paxos.state = "countingPromise";
	var message = {	"method" : "prepare_proposal",
					"proposal_id" : [++paxos.proposalId, client.playerId]
				  };

	var json = JSON.stringify(message);

	for(var i = 0 ; i < clientList.length - 2; i++){
		var port = clientList[i].port,
			host = clientList[i].address;

		exports.sendMessage(json, port, host, client.udp);
	}
	var majority = Math.floor((clientList.length - 2)/2) + 1;

	paxos.callback = function(){
		if(paxos.promiseCount >= majority){
			clearTimeout(paxos.intervalId);
			console.log("Promise phase complete, continuing to sending accept request");
			exports.sendAccept(clientList, client);
		}
	};

	paxos.intervalId = setTimeout(function(){

		if(paxos.promiseCount < majority){
			console.log("Promise majority fail, resending proposal");
			exports.sendProposal(clientList, client);
		}

	}, 20000);
};

exports.sendAccept = function(clientList, client){
	var kpuId;
	var i;
	if(paxos.previousAccepted.length){
		var maxValue = 0;
		for(i in paxos.previousAccepted){
			if(paxos.previousAccepted[i] > maxValue){
				maxValue = paxos.previousAccepted[i];
				kpuId = i;
			}
		}
	} else {
		kpuId = client.playerId;
	}


	paxos.acceptCount = 0;
	paxos.state = "countingAccept";
	var message = {	"method" : "accept_proposal",
					"proposal_id" : [paxos.proposalId, client.playerId],
				  	"kpu_id" : kpuId,
				  };

	var json = JSON.stringify(message);

	for(i = 0 ; i < clientList.length - 2; i++){
		var port = clientList[i].port,
			host = clientList[i].address;

		exports.sendMessage(json, port, host, client.udp);
	}
	
	var majority = Math.floor((clientList.length - 2)/2) + 1;

	paxos.callback = function(){
		if(paxos.acceptCount >= majority){
			clearTimeout(paxos.intervalId);
			console.log("Accept phase complete, waiting for server to respond");
			console.log("Chosen KPU: " + kpuId);
		}
	};

	paxos.intervalId = setInterval(function(){
		
		if(paxos.acceptCount < majority){
			console.log("Accept majority fail, resending proposal");
			exports.sendProposal(clientList, client);
		}
	}, 20000);
};

var isBigger = function(promise1, promise2){
	if(promise1[0] === promise2[0]){
		return promise1[1] > promise2[1];
	} else{
		return promise1[0] > promise2[0];
	}
};

methodList.prepare_proposal = function(message){
	var response;
	var acceptPromise = true;

	if(paxos.currentPromise){
		if(isBigger(paxos.currentPromise, message.proposal_id))
			acceptPromise = false;
	}

	if(acceptPromise){
		response =  { "status" : "ok",
					  "description" : "accepted"
					};
		
		if(paxos.acceptedKpu)
			response.previous_accepted = paxos.acceptedKpu;
		
		paxos.currentPromise = message.proposal_id;
	} else {
		response =  { "status" : "fail",
					  "description" : "rejected"
					};
	}

	return response;
};

methodList.accept_proposal = function(message, client){
	var response;
	var acceptKpuValue = true;

	if(paxos.currentPromise){
		if(isBigger(paxos.currentPromise, message.proposal_id))
			acceptKpuValue = false;
	}

	if(acceptKpuValue){
		response =  { "status" : "ok",
					  "description" : "accepted"
					};
		
		paxos.currentPromise = message.proposal_id;
		paxos.acceptedKpu = message.kpu_id;

		client.tcpWriter.execute("accepted_proposal", client, [paxos.acceptedKpu]);
	
	} else {
		response =  { "status" : "fail",
					  "description" : "rejected"
					};
	}

	return response;
};

methodList.countingPromise = function(message){
	if(message.status === "ok"){
		paxos.promiseCount++;

		var previousAccepted = message.previous_accepted;

		if(paxos.previousAccepted[previousAccepted]){
			paxos.previousAccepted[previousAccepted]++;
		} else {
			if(previousAccepted)
				paxos.previousAccepted[previousAccepted] = 1;
		}

		paxos.callback();
	}
};

methodList.countingAccept = function(message){
	if(message.status === "ok"){
		paxos.acceptCount++;

		paxos.callback();
	}
};