/*jshint node: true*/

/* client-processor.js */
/* Module to process the data received from the server */

"use strict";

var exports = module.exports = {};

var joinned = false;

var methodList = {}; // methodList contains function that always return an object

exports.process = function(data, client){

	var message = JSON.parse(data);
	var method = message.method || client.tcp.currentRequest;

	console.log(method);
	var response = methodList[method](message, client);
	
	// Set the currentRequest back to none, as the request has been responded
	if(!message.method)
		client.tcp.currentRequest = "";

	if(response)
		client.tcp.write(JSON.stringify(response));
};


/* Response from request join */
methodList.join = function(message,client){

	if(message.status === 'ok'){
		joinned = true;
		client.playerId = message.player_id;
		console.log("Joined the game");
	}
};

methodList.client_address = function(message, client){

	client.clientList = message.clients;
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

methodList.change_phase = function(message, client){
	var response;
	response =  { "status" : "ok"};

	if(message.time === "day")
		client.worker.addTask(client.worker.taskMethod.startPaxos(client));
	
	return response;
};

methodList.accepted_proposal = function(){

	return;
};

methodList.vote_now = function(message, client){
	var response;
	response = {"status" : "ok"};
	client.worker.addTask(client.worker.taskMethod.vote_now(message.phase));

	return response;
};

methodList.kpu_selected = function(message, client){
	client.udpHelper.paxos.isKpuSelected = true;
	client.udpHelper.paxos.kpu = message.kpu_id;
};
