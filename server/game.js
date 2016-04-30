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

module.exports = Game;