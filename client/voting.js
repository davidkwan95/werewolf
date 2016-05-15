/*jshint node: true*/

/* voting.js */
/* Module to count voting */

"use strict";

class Voting{
	constructor(numParticipants){
		this.countVote = 0;
		this.votes = {};
		this.numParticipants = numParticipants;
	}
}

Voting.prototype.addVote = function(playerId){
	if(this.votes[playerId])
		this.votes[playerId]++;
	else
		this.votes[playerId] = 1;

	this.countVote++;
};

Voting.prototype.isVotingEnd = function(){
	return this.countVote >= this.numParticipants;
};

Voting.prototype.getResult = function(){
	// Returns an array with 2 elements, 
	// The first is player killed, return -1 if none
	// Second is the voting result

	var result = Array(2);
	result[0] = -1;
	result[1] = [];
	var majority = Math.floor(this.numParticipants/2) + 1;
	for(var i in this.votes){
		if(this.votes[i] >= majority)
			result[0] = parseInt(i);

		result[1].push([parseInt(i), this.votes[i]]);
	}

	return result;

};

module.exports = Voting;