/* jshint node: true */

"use strict";

const readlineSync = require('readline-sync');

var net = require('net');
var processor = require('./client-processor.js');

var tcpHost = readlineSync.question("Enter server address: "),
	tcpPort = readlineSync.question("Enter server port: ");

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
	
	client.tcpWriter.execute("join", client);

	// Test ready
	setTimeout(function(){

		client.tcpWriter.execute("ready", client);
	}, 2000);

	// setTimeout( function(){
		
	// 	tcpWriter.execute("leave", client);
	// }, 2500 );

});

client.tcp.on('data', function(data){

	console.log("Server sent: " + data);
	processor.process(data, client);
});

client.tcp.on('close', function(){

	console.log("Server closed");
});