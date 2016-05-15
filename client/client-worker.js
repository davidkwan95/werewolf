/*jshint node: true*/

/* client-worker.js */
/* Module to consume task async */

"use strict";

const readlineSync = require('readline-sync');
var Voting = require('./voting.js');

var exports = module.exports = {};

var taskQueue = [];
exports.taskMethod = {};
var client;

exports.start = function(_client){
	taskQueue = [];
	client = _client;

	// Do this repeatedly
	setInterval(function consumeTask(){

		if(taskQueue.length){
			var task = taskQueue.pop();
			task();
		}

	}, 500);
};

exports.addTask = function(task){
	taskQueue.push(task);
};

exports.taskMethod.vote_now = function(phase){
	return function(){

		var kpuId = client.udpHelper.paxos.kpu;
		if(client.playerId === kpuId){
			var numParticipants;
			if(phase === "day")
				numParticipants = client.clientList.length;

			client.voting = new Voting(numParticipants);
		}

		var id = parseInt(readlineSync.question("Enter the id that you want to kill: "));

		var kpuUdpInfo = client.udpHelper.getUdpInfo(kpuId, client.clientList);
		var message = { "method" : phase === "night"?"vote_werewolf":"vote_civilian",
						"player_id" : id
					  };
		var json = JSON.stringify(message);
		client.udpHelper.sendMessage(json, kpuUdpInfo.port, kpuUdpInfo.address, client.udp);
	};
};

exports.taskMethod.startPaxos = function(client){
	return function(){
		client.clientList = -1;
		client.tcpWriter.execute("client_address", client);

		// Wait until clientList is updated, then start Paxos
		var intervalId = setInterval(function(){
			if(client.clientList !== -1){
				clearTimeout(intervalId);
				client.udpHelper.startPaxos(client.clientList, client);
			}

		}, 500);
	};
};