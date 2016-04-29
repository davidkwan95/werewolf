/*jshint node: true*/

/* process.js */
/* Module to process the data received from the server */

"use strict";

var exports = module.exports = {};

var playerCounter = 0; // Use to determine player id

var methodList = {}; // methodList contains function that always return an object

/* Input = Stringify Object 
   Output = Stringify Object */
exports.process = function(data){
	var message = JSON.parse(data);
	var method = message.method;
	
	var result = methodList[method](message);
	return JSON.stringify(result);
};

methodList.join = function(message){
	playerCounter++;
	
	var response;
	response =  { "status" : "ok",
				  "player_id" : playerCounter
				};

	return response;
};