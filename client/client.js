/* jshint node: true */

"use strict";

const readlineSync = require('readline-sync');

var net = require('net');
var processor = require('./client-processor.js');
var tcpHost = '127.0.0.1',
	tcpPort = '7777';

var dgram = require('dgram');
var udpHost = '127.0.0.1', // udpHost will be entered by user later
	udpPort = readlineSync.question("Enter port number to bind to: ");

// This part is used for tcp connection to the server
var tcp = new net.Socket();
tcp.connect(tcpPort, tcpHost, function(){

	tcp.method = "";
	console.log("Connected to: " + tcpHost + ":" + tcpPort);
	
	var username = readlineSync.question("Enter your username: ");
	
	// Join method
	tcp.method = "join";
	var message = { "method" : "join",
					"username" : username,
					"udp_host" : udpHost,
					"udp_port" : udpPort
				  };
	var json = JSON.stringify(message);
	tcp.write(json);

	// List client
	setTimeout(function(){
		tcp.method = "client_address";
		message = { "method" : "client_address" };
		json = JSON.stringify(message);
		tcp.write(json);
	}, 1000);

	setTimeout( function(){
		tcp.method = "ready";
		message = { "method" : "ready" }; // Test ready
		json = JSON.stringify(message);
		tcp.write(json);	
	}, 1000 );

	setTimeout( function(){
		tcp.method = "leave";
		message = { "method" : "leave" }; // Test leave
		json = JSON.stringify(message);
		tcp.write(json);	
	}, 1000 );

});

tcp.on('data', function(data){

	console.log("Server sent: " + data);
	processor.process(data, tcp);
});

tcp.on('close', function(){

	console.log("Server closed");
});

// This part is used for udp connection to the client
var udp = dgram.createSocket('udp4');

udp.on('message', function(data, remote){
	
	console.log(remote.address+":"+remote.port + " sent: " + data);
});

udp.bind(udpPort);
console.log("Binding to portno: " + udpPort);