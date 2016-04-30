/* jshint node:true */

/* player.js */
/* Definition of the class Player */

"use strict";

class Player{
	constructor(playerId, username, udpHost, udpPort, sock){
		this.playerId = playerId;
		this.username = username;
		this.udpHost = udpHost;
		this.udpPort = udpPort;
		this.sock = sock;
		this.readyStat = 0;
	}
}

Player.prototype.randomWerewolf = function(playerList){
	var countWerewolf = 0;
	var roleList = [];
	var role;
	for (var i = 0;i<playerList.length();i++){
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
			if (i == playerList.length()-2 && countWerewolf == 0){
				role = 1;
				roleList.push(role);
				roleList.push(role);
				countWerewolf += 2;
				break;
			} else if (i == playerList.length()-1 && countWerewolf == 1){
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

module.exports = Player;