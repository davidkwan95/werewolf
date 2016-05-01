/*jshint node: true*/

/* tcp-writer.js */
/* Module to write JSON and send it to the server via TCP */

"use strict";

var exports = module.exports = {};

var dgram = require('dgram');

const readlineSync = require('readline-sync');
var commandList = {}; // methodList contains function that always return an object


exports.execute = function(command, client){

	if(client.tcp.currentRequest){
		console.log("The previous request has not finished, try again later!");
		return;
	}

	if(!commandList[command]){
		console.log("Incorrect command");
		return;
	}

	var message = commandList[command](client);
	client.tcp.currentRequest = command;

	client.tcp.write(JSON.stringify(message));
};


/* Response from request join */
commandList.join = function(client){

	client.username = readlineSync.question("Enter your username: ");
	
	client.udpHost = "127.0.0.1";
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

	client.udp.bind(client.udpPort, "127.0.0.1");
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

commandList.vote_result_civilian = function(){
	
	var message = { "method" : "vote_result_civilian",
					"vote_status" : 1,
					"player_killed" : 4, // ganti setelah dapet player mati
					"vote_result" : "[1, 2]"
				  };
	return message;
};

commandList.vote_result = function(){
	
	var message = { "method" : "vote_result_civilian",
					"vote_status" : -1,
					"vote_result" : "[1, 2]"
				  };
	return message;
};

commandList.vote_result_werewolf = function(){
	
	var message = { "method" : "vote_result_werewolf",
					"vote_status" : 1,
					"player_killed" : 4, // ganti setelah dapet player mati
					"vote_result" : "[1, 2]"
				  };
	return message;
};