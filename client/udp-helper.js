/*jshint node: true*/

/* udp-helper.js */
/* Module to help sending and receiving data via udp */

"use strict";

var exports = module.exports = {};
var paxos = {};

var methodList = {};

exports.process = function(data, remote, client){

	var message = JSON.parse(data);
	var method = message.method || paxos.state;

	var response = methodList[method](message, client);

	if(response){
		var json = JSON.stringify(response);
		client.udpHelper.sendMessage(json, remote.port, remote.host, client.udp);
	}
};

exports.sendMessage = function(string, port, host, udp){
	var message = new Buffer(string);

	udp.send(message, 0, message.length, port, host, function(err) {
	    if (err) throw err;
	    console.log('UDP message sent to ' + host +':'+ port + " " + message);
	});
};


// For selecting leader in a round
exports.startPaxos = function(clientList, client){

	paxos.isKpuSelected = false;
	paxos.isProposer = false;
	paxos.proposalId = 1;

	if(clientList[clientList.length-1].username === client.username || 
		clientList[clientList.length-2].username === client.username){
		paxos.isProposer = true;
	}

	if(paxos.isProposer){
		exports.sendProposal(clientList, client);
	}
};

exports.sendProposal = function(clientList, client){

	paxos.promiseCount = 0;

	paxos.state = "countingPromise";
	var message = {	"method" : "prepare_proposal",
					"proposal_id" : [paxos.proposalId++, client.playerId]
				  };

	var json = JSON.stringify(message);

	for(var i = 0 ; i < clientList.length - 2; i++){
		var port = clientList[i].port,
			host = clientList[i].address;

		exports.sendMessage(json, port, host, client.udp);
	}

	var majority = Math.floor((clientList.length - 2)/2) + 1;
	console.log("Majority " + majority);

	var intervalId = setInterval(function(){
		var i = 0;
		if(i > 2*100 || paxos.promiseCount >= majority)
			clearTimeout(intervalId);
	}, 100);

	if(paxos.promiseCount >= majority){
		console.log("Promise phase done, continuing to accept phase");
		exports.sendAccept(clientList, client);
	} else{
		console.log("Majority fail, resending proposal");
		exports.sendProposal(clientList, client);
	}
};

exports.sendAccept = function(clientList, client){
	
};


methodList.prepare_proposal = function(message){
	var response;
	var acceptPromise = true;
	
	var isBigger = function(promise1, promise2){
		if(promise1[0] === promise2[0]){
			return promise1[1] > promise2[1];
		} else{
			return promise1[0] > promise2[0];
		}
	};

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

methodList.countingPromise = function(message){
	if(message.status === "ok"){
		paxos.promiseCount++;
		console.log(paxos.promiseCount);
	}
};