/*jshint node: true*/

/* server.js */
/* Receiving and sending data from client */

"use strict";

var net = require('net');
var processor = require('./server-processor.js');

var host = '127.0.0.1',
	port = 7777;

var server = net.createServer(function(sock){

	sock.ip = sock.remoteAddress;
	sock.port = sock.remotePort;

	console.log("Connection from: " + sock.ip + ":" + sock.port);

	sock.on('data', function(data){
		console.log("Received Message from " + sock.ip + ":" + sock.port + " = " + data);
		
		var response = processor.process(data, sock);
		console.log("Sent message to " + sock.ip + ":" + sock.port + " = " + response);
		sock.write(response);
	});

	sock.on('close', function(){
		console.log("Disconnected: ", + sock.ip + " " + sock.port);
	});

});

server.listen(port, host);

console.log('Listening on ' + host + ":" + port);