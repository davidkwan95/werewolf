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
		if (role == 1){
			if (countWerewolf < 2){
				roleList.push(role);
				countWerewolf++;
			} else {
				role = 0;
				roleList.push(role);
			}
		} else {
			if (i == this.playerList.length()-2 && countWerewolf == 0){
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
	var roleList = randomWerewolf();
	for(var i=0; i<this.playerList.length; i++){
		if(roleList[i] == 1)
			playerList[i].role = "werewolf";
		else
			playerList[i].role = "civilian";
	)
}

Game.prototype.startGame = function(){
	var message;
	var roleList = randomWerewolf();
	var listWerewolf = [];
	var werewolf = 0;
	var count = 0;
	while(werewolf < 2){
		if(this.playerList[count] === "werewolf"){	
			listWerewolf[werewolf] = this.playerList[count];
			werewolf++;
		}
		count++;
	}
	werewolf = 0;
	for(var i=0; i<this.playerList.length; i++){
		if(this.playerList[i].role == "civilian"){
			message = { "method" = "start",
						"time" = "night",
						"role" = this.playerList[i].role,
						"friend" = "",
						"description" = "game is started",
					}
		} else{
			if(werewolf == 0){
				message = { "method" = "start",
						"time" = "night",
						"role" = this.playerList[i].role,
						"friend" = [listWerewolf[1].username],
						"description" = "game is started",
					}	
			} else{
				message = { "method" = "start",
						"time" = "night",
						"role" = this.playerList[i].role,
						"friend" = [listWerewolf[0].username],
						"description" = "game is started",
					}
			}
			werewolf++;
		}
	}	
}

module.exports = Game;