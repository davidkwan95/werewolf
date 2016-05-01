/* jshint node:true */

/* game.js */
/* Definition of the class Game */

"use strict";

class Game{
	constructor(){
		this.playerList = [];
		this.usernameMap = {};
		this.start = false;
		this.phase = [1,"night"];
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
	for (var i = 0;i<this.playerList.length();i++){
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
			if (i === this.playerList.length()-2 && countWerewolf === 0){
				role = 1;
				roleList.push(role);
				roleList.push(role);
				countWerewolf += 2;
				break;
			} else if (i == this.playerList.length()-1 && countWerewolf == 1){
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

Game.prototype.startGame = function(){
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
};

Game.prototype.changePhase = function(){
	var message;
	var stringMessage;
	if(this.phase[1] === "night"){
		message = {
					"method" : "change_phase",
					"time" : "day",
					"days" : 3,
					"description" : "",
				};
		this.phase[1] = "day";
		stringMessage = JSON.stringify(message);
		for(var i=0; i<this.playerList.length; i++){
			this.playerList[i].sock.write(stringMessage);
		}
	} else{
		message = {
					"method" : "change_phase",
					"time" : "night",
					"days" : 3,
					"description" : "",
				};
		this.phase[1] = "night";
		stringMessage = JSON.stringify(message);
		for(var i=0; i<this.playerList.length; i++){
			this.playerList[i].sock.write(stringMessage);
		}
	}
};

Game.prototype.timeToVote = function(){
	var message;
	if(this.start == true){
		message = {
					"method" = "vote_now",
					"phase" = this.phase[1];
				};
	}
}

module.exports = Game;