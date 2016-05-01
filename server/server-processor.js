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
	if(game.isUserExist(sock.username)){
		game.removePlayer(sock.username);
		console.log(sock.username);
		response =  { "status" : "ok"};
	}
	else{
		response =  { "status" : "fail",
					  "description" : "not in a room"
					};
	}
	
	return response;
};

methodList.ready = function(message, sock){

	var response;
	if(game.isUserExist(sock.username)){
		game.changeReadyStat(sock.username);
		response =  { "status" : "ok",
					  "description" : "waiting for other player to start"
					};
	}
	else{
		response =  { "status" : "fail",
					  "description" : "not in a room"
					};	
	}
	
	return response;
};

methodList.accepted_proposal = function(message, sock){
	var response;
	var majority = Math.floor((game.playerList.length-2)/2) + 1;

	if(game.kpuVote[message.kpu_id]){
		
		game.kpuVote[message.kpu_id]++;
		if(game.kpuVote[message.kpu_id] >= majority && game.selectedKpu < 0){
			console.log("Majority reached! Kpu selected");
			methodList.kpuSelected(message.kpu_id, sock);
			game.selectedKpu = message.kpu_id;
		}

	} else {
		game.kpuVote[message.kpu_id] = 1;
	}

	response =  { "status" : "ok",
				  "description" : ""
				};

	return response;
};

methodList.vote_result_civilian = function(message, sock){
	var response;
	if(message.vote_status == 1){
		game.killPlayer(message.player_killed);
		response =  { "status" : "ok",
					  "description" : "player " + message.player_killed + " is killed"
					};
	}else if (message.vote_status == -1){
		response =  { "status" : "ok",
					  "description" : ""
					};
	}

	return response;
};

methodList.vote_result_werewolf = function(message, sock){
	var response;
	if(message.vote_status == 1){
		game.killPlayer(message.player_killed);
		response =  { "status" : "ok",
					  "description" : "player " + message.player_killed + " is killed"
					};
	}else if (message.vote_status == -1){
		response =  { "status" : "ok",
					  "description" : ""
					};
	}

	return response;
};

// methodList.start = function(message, sock){

// 	var response;
// 	if (game.isReadyAll && game.playerList.length >= 6){
// 		game.startGame;
// 		response =  { "status" : "ok",
// 					};
// 	}else if(game.isReadyAll){
// 		response =  { "status" : "fail",
// 					  "description" : "all players must be ready"
// 					};	
// 	}else{
// 		response =  { "status" : "fail",
// 					  "description" : "the number of players is less than 6"
// 					};
// 	}
	
// 	return response;
// };

methodList.gameOver = function(message, sock){

	var response;
	if (game.isGameOver() !== 0){
		game.gameOver();
		response =  { "status" : "ok",
					};
	} else {
		response =  { "status" : "fail",
					  "description" : ""
					};
	}
	
	return response;
};

methodList.kpuSelected = function(message, sock){

	var response;
	if (game.isKpuSelected() !== 0){
		game.kpuSelected();
		response =  { "status" : "ok",
					};
	} else {
		response =  { "status" : "fail",
					  "description" : ""
					};
	}
	
	return response;
};
