/* jshint node: true */

"use strict";

// const readlineSync = require('readline-sync');

var net = require('net');
var processor = require('./client-processor.js');

var tcpHost = '127.0.0.1',
	tcpPort = '7777';

var client = {}; // Store information about the user who runs the program
client.tcpWriter = require('./tcp-writer');
client.udpHelper = require('./udp-helper.js');

// This part is used for tcp connection to the server
client.tcp = new net.Socket();
client.tcp.connect(tcpPort, tcpHost, function(){

	client.tcp.currentRequest = "";
	console.log("Connected to: " + tcpHost + ":" + tcpPort);
	
	client.tcpWriter.execute("join", client);

	// List client
	setTimeout(function(){

		client.tcpWriter.execute("client_address", client);
	}, 1000);

	// // Test ready
	// setTimeout(function(){

	// 	tcpWriter.execute("ready", client);
	// }, 2000);

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