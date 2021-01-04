const Discord = require('discord.js');

const fs = require('fs');


// Will be provided by what ever requires a log;

class Logger {
	constructor(data) {
		this.localPrefix = '';
		if(!data) return;

		fs.mkdir('logs', function(err) {
			if(err) {
				console.log('Failed to create logs folder, no logs will be saved');
			}
		});

		this.logFile = ('logs/' + data.server.id + '.log');
		this.server = data.server;
		this.logChannel = data.logChannel;
		this.bot = data.bot;
		this.localPrefix = data.prefix ? data.prefix : '[null]';

	}

	local(msg) {
		console.log(this.localPrefix + msg);
		fs.appendFile(this.logFile, this.localPrefix + msg + '\n', function(err) {
			if(err) {
				console.log('Failed to log to file');
			}
		});
	}

	/**
	* Used for constant debug messages
	*/
	localDebug(msg) {
		const finalMsg = this.localPrefix + '[Debug]' + msg;
		console.log(finalMsg);
		fs.appendFile(this.logFile, finalMsg + '\n', function(err) {
			if(err) {
				console.log('Failed to log to file');
			}
		});
	}

	localErr(msg, stacktrace = false) {
		const errorMessage = 'Error: ' + msg;

		if(stacktrace) {
			console.trace(errorMessage);
		}
		else{
			console.log(errorMessage);
		}
	}

	log(title, msg, color = '#fffff') {

		// If no server or logchannel is found
		if(!this.server || !this.logChannel) {
			console.log(title + color + '\n' + msg);
			return;
		}

		// Generate embeded and log
		const embed = this.generateMsg(title, msg, color);

		this.logChannel.send(embed);
	}

	logErr(errMessage, details) {
		this.log(errMessage, details, '#f5425d');
	}

	dm(recieverID, title, msg, color = '#fffff') {
		if(!this.bot) {
			this.localErr('Failed to send DM, no bot found');
			return;
		}

		const embed = this.generateMsg(title, msg, color);

		this.bot.users.cache.fetch(recieverID).then((user) =>{
			user.send(embed);
		});
	}


	dmInvalidCommand(recieverID, theirMessage, msg) {
		this.dm(recieverID, 'Error: Invalid Command', '*\'' + theirMessage + '\'*\n' + msg, '#f5425d');
	}

	generateMsg(title, msg, color = '#fffff') {
		return new Discord.MessageEmbed()
			.setColor(color)
			.setTitle(title)
			.setDescription(msg)
			.setTimestamp();
	}

}


module.exports = Logger;
