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

	var responses = data.toString().split("\n");

	for(var i=0; i<responses.length-1; i++){
		var message = JSON.parse(responses[i]);
		var method = message.method;
		
		if(method){
			var result = methodList[method](message, sock);
			if(result){
				var stringMessage =  JSON.stringify(result);
				console.log("Sent message to " + sock.ip + ":" + sock.port + " = " + stringMessage);
				sock.write(stringMessage + '\n');
			}
		}
	}
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
	
	sock.write(JSON.stringify(response) + '\n');

	if(game.playerList.length >=6 && game.isReadyAll()){
		game.startGame();
	}
};

methodList.accepted_proposal = function(message){
	var response;
	var majority = Math.floor((game.playerList.length-2)/2) + 1;

	if(game.kpuVote[message.kpu_id]){
		
		game.kpuVote[message.kpu_id]++;
		if(game.kpuVote[message.kpu_id] >= majority && !game.isKpuSelected()){
			console.log("Majority reached! Kpu selected");
			game.selectedKpu = message.kpu_id;
			game.kpuSelected();
		}

	} else {
		game.kpuVote[message.kpu_id] = 1;
	}

	response =  { "status" : "ok",
				  "description" : ""
				};

	return response;
};

methodList.vote_result_civilian = function(message){
	var response;
	if(message.vote_status == 1){
		game.killPlayer(message.player_killed);
		response =  { "status" : "ok",
					  "description" : "player " + message.player_killed + " is killed"
					};

		game.changedState = true;
		if(game.isGameOver()){
			game.state = "gameOver";
		} else {
			game.state = "changePhase";
		}

	} else if (message.vote_status == -1){
		response =  { "status" : "ok",
					  "description" : ""
					};
		game.changedState = true;
		game.state = "vote";
	}

	return response;
};

methodList.vote_result_werewolf = function(message){
	var response;
	if(message.vote_status == 1){
		game.killPlayer(message.player_killed);
		response =  { "status" : "ok",
					  "description" : "player " + message.player_killed + " is killed"
					};

		game.changedState = true;
		if(game.isGameOver()){
			game.state = "gameOver";
		} else {
			game.state = "changePhase";
		}

	} else if (message.vote_status === -1){
		response =  { "status" : "ok",
					  "description" : ""
					};

		game.changedState = true;
		game.state = "vote";
	}

	return response;
};

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
	if (game.isKpuSelected()){
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
