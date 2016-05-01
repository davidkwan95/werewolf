/*jshint node: true*/

/* client-processor.js */
/* Module to process the data received from the server */

"use strict";

var exports = module.exports = {};

var clientList = [];
var joinned = false;

var methodList = {}; // methodList contains function that always return an object

/* Input = Stringify Object 
   Output = Stringify Object */
exports.process = function(data, tcp){

	var message = JSON.parse(data);
	var method = message.method || tcp.currentRequest;

	console.log(method);
	var result = methodList[method](message, tcp);
	
	// Set the currentRequest back to none, as the request has been responded
	tcp.currentRequest = ""; 

	return JSON.stringify(result);
};


/* Response from request join */
methodList.join = function(message){

	if(message.status === 'ok'){
		joinned = true;
		console.log("Joined the game");
	}
};

methodList.client_address = function(message){

	clientList = message.clients;
	for(var i=0; i<clientList; i++){
		
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
	response =  { "status" : "ok"}
	
	return response;
};

methodList.changePhase = function(){
	var response;
	response =  { "status" : "ok"}
	
	return response;
};