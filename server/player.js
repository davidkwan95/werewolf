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
		this.isAlive = 1;
		this.readyStat = 0;
		this.role = "";
	}
}

module.exports = Player;