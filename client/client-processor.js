/*jshint node: true*/

/* client-processor.js */
/* Module to process the data received from the server */

"use strict";

var udpHelper = require('./udp-helper.js');

var exports = module.exports = {};

var clientList = [];
var joinned = false;

var methodList = {}; // methodList contains function that always return an object


exports.process = function(data, client){

	var message = JSON.parse(data);
	var method = message.method || client.tcp.currentRequest;

	console.log(method);
	methodList[method](message, client);
	
	// Set the currentRequest back to none, as the request has been responded
	client.tcp.currentRequest = ""; 
};


/* Response from request join */
methodList.join = function(message){

	if(message.status === 'ok'){
		joinned = true;
		console.log("Joined the game");
	}
};

methodList.client_address = function(message, client){

	clientList = message.clients;

	for(var i=0; i<clientList.length; i++){
		var port = clientList[i].port,
			host = clientList[i].address;

		var udpMessage = "Hello " + clientList[i].username + " from " + client.username; 
		console.log(udpMessage);
		udpHelper.sendMessage(udpMessage, port, host, client.udp);
	}
};

methodList.ready = function(){
	return;
};

methodList.leave = function(){
	return;
};


methodList.start = function(){
	var response;
	response =  { "status" : "ok"};
	
	return response;
};

methodList.changePhase = function(){
	var response;
	response =  { "status" : "ok"};
	
	return response;
};

methodList.timeToVote = function(){
	var response;
	response = {"status" : "ok"};

	return response;
}