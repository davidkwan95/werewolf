/*jshint node: true*/

/* process.js */
/* Module to process the data received from the server */

"use strict";

var exports = module.exports = {};
var Player = require('./player.js');
var Game = require('./game.js');

var game = new Game();

var playerCounter = 0; // Use to determine player id
var methodList = {}; // methodList contains function that always return an object

/* Input = Stringify Object 
   Output = Stringify Object */
exports.process = function(data, sock){

	var message = JSON.parse(data);
	var method = message.method;
	
	var result = methodList[method](message, sock);
	return JSON.stringify(result);
};

methodList.join = function(message, sock){

	var response;
	if(!game.isUserExist(message.username)){
		
		var player = new Player(playerCounter, message.username, message.udp_host, message.udp_port, sock);
		game.addPlayer(player);
		sock.username = message.username;

		response =  { "status" : "ok",
				  	  "player_id" : playerCounter++
					};
	} else {
		response =  { "status" : "fail",
					  "description" : "user exists"
					};
	}

	return response;
};

methodList.client_address = function(){

	var response;
	var clients = [];

	var playerList = game.playerList;

	for(var i=0; i<playerList.length; i++){

		var player = playerList[i];
		var client = {};
		client.player_id = player.playerId;
		client.is_alive = player.isAlive;
		client.address = player.udpHost;
		client.port = player.udpPort;
		client.username = player.username;
		if(!player.isAlive)
			client.role = player.role;

		clients.push(client);
	}

	response =  { "status" : "ok",
				  "clients" : clients
				};

	return response;
};


methodList.leave = function(message, sock){

	var response;
	game.removePlayer(sock.username);
	response =  { "status" : "ok"};
	
	return response;
};

methodList.ready = function(message, sock){

	var response;
	game.removePlayer(sock.username);
	response =  { "status" : "ok"};
	
	return response;
};