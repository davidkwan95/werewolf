/* jshint node: true */

"use strict";

const readlineSync = require('readline-sync');

var net = require('net');
var processor = require('./client-processor.js');

var tcpHost = "127.0.0.1",
	tcpPort = 7777;
// var tcpHost = readlineSync.question("Enter server address: "),
// 	tcpPort = readlineSync.question("Enter server port: ");

var client = {}; // Store information about the user who runs the program
client.tcpWriter = require('./tcp-writer');
client.udpHelper = require('./udp-helper.js');
client.worker = require('./client-worker.js');
client.worker.start(client);

// This part is used for tcp connection to the server
client.tcp = new net.Socket();
client.tcp.connect(tcpPort, tcpHost, function(){

	client.tcp.currentRequest = "";
	console.log("Connected to: " + tcpHost + ":" + tcpPort);

	client.ready = false;
	setInterval(function(){
		if(!client.ready){
			var command = readlineSync.question("Enter command: ");			
			client.tcpWriter.execute(command,client);
		}
	}, 500);

});

client.tcp.on('data', function(data){

	console.log("Server sent: " + data);
	processor.process(data, client);
});

client.tcp.on('close', function(){

	console.log("Server closed");
});