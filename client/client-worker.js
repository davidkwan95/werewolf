/*jshint node: true*/

/* client-worker.js */
/* Module to consume task async */

"use strict";

const readlineSync = require('readline-sync');

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
	var id = readlineSync.question("Enter the id that you want to kill: ");
	var kpuId = client.udpHelper.paxos.kpu;

	var kpuUdpInfo = client.udpHelper.getUdpInfo(kpuId, client.clientList);
	var message = { "method" : phase === "night"?"vote_werewolf":"vote_civillian",
					"player_id" : id
				  };

	var json = JSON.stringify(message);
	client.udpHelper.sendMessage(json, kpuUdpInfo.port, kpuUdpInfo.address, client.udp);
};