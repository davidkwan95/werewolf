/*jshint node: true*/

/* udp-helper.js */
/* Module to help sending and receiving data via udp */

"use strict";

var exports = module.exports = {};
var paxos = {};

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

	if(clientList[clientList.length-1].username === client.username || clientList[clientList.length-2] === client.username){
		paxos.isProposer = true;
	}

	if(paxos.isProposer){
		exports.sendProposal(clientList, client);
	}
};

exports.sendProposal = function(clientList, client){

	var message = {	"method" : "prepare_proposal",
					"proposal_id" : [paxos.proposal_id++, client.playerId]
				  };

	var json = JSON.stringify(message);

	for(var i = 0 ; i < clientList.length - 2; i++){
		var port = clientList[i].port,
			host = clientList[i].address;

		exports.sendMessage(json, port, host, client.udp);
	}

	// setInterval(function(){
	// 	if()

	// }, 100);
};

exports.sendAccept = function(){

};