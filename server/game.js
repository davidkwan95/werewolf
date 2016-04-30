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
	var index = this.playerList.push(player);
	this.usernameMap[player.username] = index - 1;
};

Game.prototype.isUserExist = function(username){

	return this.usernameMap[username] >= 0;
};

module.exports = Game;