/*jshint node: true*/

/* tcp-writer.js */
/* Module to write JSON and send it to the server via TCP */

"use strict";

var exports = module.exports = {};

var dgram = require('dgram');

const readlineSync = require('readline-sync');
var commandList = {}; // methodList contains function that always return an object


exports.execute = function(command, client, args){

	if(client.tcp.currentRequest){
		console.log("The previous request has not finished, try again later!");
		return;
	}

	if(!commandList[command]){
		console.log("Incorrect command");
		return;
	}

	var message = commandList[command](client, args);
	client.tcp.currentRequest = command;

	client.tcp.write(JSON.stringify(message));
};


/* Response from request join */
commandList.join = function(client){

	client.username = readlineSync.question("Enter your username: ");
	
	client.udpHost = readlineSync.question("Enter your address (UDP): ");
	client.udpPort = readlineSync.question("Enter port number to bind to: ");

	var message = { "method" : "join",
					"username" : client.username,
					"udp_host" : client.udpHost,
					"udp_port" : client.udpPort
				  };

	// This part is used for udp connection to the client
	client.udp = dgram.createSocket('udp4');

	client.udp.on('message', function(data, remote){
		
		console.log("Client " + remote.address + ":" + remote.port + " sent: " + data);
		client.udpHelper.process(data, remote, client);

	});

	client.udp.bind(client.udpPort);
	console.log("Binding to portno: " + client.udpPort);

	return message;

};

commandList.client_address = function(){

	var message = { "method" : "client_address" };
	
	return message;
};

commandList.ready = function(){

	var message = { "method" : "ready" }; // Test ready
	
	return message;
};

commandList.leave = function(){
	
	var message = { "method" : "leave" }; // Test leave

	return message;
};

commandList.accepted_proposal = function(client, args){
	var kpuId = args[0];

	var message = { "method" : "accepted_proposal",
					"kpu_id" : kpuId,
					"description" : "Kpu is selected"
				  };

	return message;
};

commandList.vote_result_civilian = function(client, args){
	var playerKilled = args[0];
	var voteResult = args[1];
	var message = { "method" : "vote_result_civilian",
					"vote_result" : voteResult
				  };
	if(playerKilled>=0){
		message.vote_status = 1;
		message.player_killed = playerKilled;
	} else{
		message.vote_status = -1;
	}

	return message;	
};

commandList.vote_result_werewolf = function(client, args){
	var playerKilled = args[0];
	var voteResult = args[1];
	var message = { "method" : "vote_result_werewolf",
					"vote_result" : voteResult
				  };
	if(playerKilled>=0){
		message.vote_status = 1;
		message.player_killed = playerKilled;
	} else{
		message.vote_status = -1;
	}

	return message;
};