/* jshint node:true */

/* game.js */
/* Definition of the class Game */

"use strict";

class Game{
	constructor(){
		this.playerList = [];
		this.usernameMap = {};
		this.start = false;
		this.phase = [0,"night"];
		this.kpuVote = {};
		this.selectedKpu = -1;
	}
}

Game.prototype.addPlayer = function(player){

	// gets the new length of the object upon pushing
	this.playerList.push(player);
	this.usernameMap[player.username] = 1;

};

Game.prototype.isUserExist = function(username){

	return this.usernameMap[username] >= 0;
};

Game.prototype.removePlayer = function(username){
	for (var i = 0;i<this.playerList.length;i++){
		console.log("Username " + username);
		console.log("Username Player List " + this.playerList[i].username);
		if (this.playerList[i].username === username){
			this.playerList.splice(i,1);
		}
	}
	console.log("Hash " + this.usernameMap[username]);
	delete this.usernameMap[username];
};

Game.prototype.changeReadyStat = function(username){	
	for (var i = 0;i<this.playerList.length;i++){
		if (this.playerList[i].username === username){
			this.playerList[i].readyStat = 1;
		}
	}
};

Game.prototype.isReadyAll = function(){
	var ready = 1;
	for (var i = 0;i<this.playerList.length;i++){
		if (this.playerList[i].readyStat === 0){
			ready = 0;
		}
	}
	return ready;
};

Game.prototype.randomWerewolf = function(){
	var countWerewolf = 0;
	var roleList = [];
	var role;
	for (var i = 0;i<this.playerList.length;i++){
		role = Math.random();
		if (role === 1){
			if (countWerewolf < 2){
				roleList.push(role);
				countWerewolf++;
			} else {
				role = 0;
				roleList.push(role);
			}
		} else {
			if (i === this.playerList.length - 2 && countWerewolf === 0){
				role = 1;
				roleList.push(role);
				roleList.push(role);
				countWerewolf += 2;
				break;
			} else if (i == this.playerList.length - 1 && countWerewolf == 1){
				role = 1;
				roleList.push(role);
				countWerewolf++;
				break;
			} else {
				roleList.push(role);
			}
		}
		
	}
	return roleList;
};

Game.prototype.setPlayerRole = function(){
	var roleList = this.randomWerewolf();
	for(var i=0; i<this.playerList.length; i++){
		if(roleList[i] == 1)
			this.playerList[i].role = "werewolf";
		else
			this.playerList[i].role = "civilian";
	}
};

Game.prototype.killPlayer = function(playerId){	
	for(var i=0; i<this.playerList.length; i++){
		if(this.playerList.playerId == playerId){
			this.playerList.isAlive = 0;
		}
	}
};

Game.prototype.startGame = function(){
	this.setPlayerRole();

	var message;
	var listWerewolf = [];
	var werewolf = 0;
	var count = 0;
	while(werewolf < 2){
		if(this.playerList[count].role === "werewolf"){	
			listWerewolf[werewolf] = this.playerList[count];
			werewolf++;
		}
		count++;
	}
	werewolf = 0;
	var stringMessage;
	for(var i=0; i<this.playerList.length; i++){
		if(this.playerList[i].role == "civilian"){
			message = { "method" : "start",
						"time" : "day",
						"role" : this.playerList[i].role,
						"friend" : "",
						"description" : "game is started",
					  };
			stringMessage = JSON.stringify(message);
			this.playerList[i].sock.write(stringMessage);
		} else{
			if(werewolf === 0){
				message = { "method" : "start",
							"time" : "day",
							"role" : this.playerList[i].role,
							"friend" : [listWerewolf[1].username],
							"description" : "game is started",
						  };	
			} else{
				message = { "method" : "start",
							"time" : "day",
							"role" : this.playerList[i].role,
							"friend" : [listWerewolf[0].username],
							"description" : "game is started",
						  };
			}
			stringMessage = JSON.stringify(message);
			this.playerList[i].sock.write(stringMessage);
			werewolf++;
		}
	}

	this.start = true;

	var game = this;
	setTimeout(function(){
		game.changePhase();
	}, 1000);

	// Async check the state of the game, if changed, execute
	// the appropriate task

	setInterval(function(){

	}, 500);

};

Game.prototype.changePhase = function(){
	var message;
	var stringMessage;
	var i;
	if(this.phase[1] === "night"){
		message = {
					"method" : "change_phase",
					"time" : "day",
					"days" : ++this.phase[0],
					"description" : "",
				};
		this.phase[1] = "day";
		stringMessage = JSON.stringify(message);
		for(i=0; i<this.playerList.length; i++){
			this.playerList[i].sock.write(stringMessage);
		}
	} else{
		message = {
					"method" : "change_phase",
					"time" : "night",
					"days" : this.phase[0],
					"description" : "",
				};
		this.phase[1] = "night";
		stringMessage = JSON.stringify(message);
		for(i=0; i<this.playerList.length; i++){
			this.playerList[i].sock.write(stringMessage);
		}
	}
};

Game.prototype.timeToVote = function(){
	var message;
	var stringMessage;
	
	message = {
				"method" : "vote_now",
				"phase" : this.phase[1]
			  };
	stringMessage = JSON.stringify(message);
	for(var i=0; i<this.playerList.length; i++){
		var sock = this.playerList[i].sock;
		console.log("Sent message to " + sock.ip + ":" + sock.port + " = " + stringMessage);
		sock.write(stringMessage);
	}
	
};

Game.prototype.isGameOver = function(){
	var countWerewolf = 0;
	var countCivilian = 0;
	for(var i=0; i<this.playerList.length; i++){
		if(this.playerList[i].role == "civilian" && this.playerList[i].isAlive === 1){
			countCivilian++;
		} else if(this.playerList[i].role == "werewolf" && this.playerList[i].isAlive === 1){
			countWerewolf++;
		}
	}
	if (countWerewolf === 0){
		return 1;
	} else if (countWerewolf === countCivilian){
		return 2;
	} else {
		return 0;
	}
};

Game.prototype.gameOver = function(){
	var message;
	var stringMessage;
	if (this.isGameOver() === 1){
		message = { "method" : "game_over",
					"winner" : "civilian",
					"description" : ""
				  };
		stringMessage = JSON.stringify(message);
		for(var i=0; i<this.playerList.length; i++){
			this.playerList[i].sock.write(stringMessage);
		}
	} else if (this.isGameOver() === 2){
		message = { "method" : "game_over",
					"winner" : "werewolf",
					"description" : ""
				  };
		stringMessage = JSON.stringify(message);
		for(var i=0; i<this.playerList.length; i++){
			this.playerList[i].sock.write(stringMessage);
		}
	}
};

Game.prototype.isKpuSelected = function(){
	return this.selectedKpu >= 0;
};

Game.prototype.kpuSelected = function(){
	console.log("Halo, kpunya: " + this.selectedKpu);
	var message;
	var stringMessage;
	if (this.isKpuSelected()){ // KPU is selected
		message = { "method" : "kpu_selected",
					"kpu_id" : this.selectedKpu
				  };
		stringMessage = JSON.stringify(message);
		for(var i=0; i<this.playerList.length; i++){
			var sock = this.playerList[i].sock;
			console.log("Sent message to " + sock.ip + ":" + sock.port + " = " + stringMessage);
			sock.write(stringMessage);
		}
	}

	var game = this;
	setTimeout(function(){
		game.timeToVote();
	}, 1000);

};

module.exports = Game;