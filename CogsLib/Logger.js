const Discord = require('discord.js');

// Will be provided by what ever requires a log;
module.exports.server = false;
module.exports.logChannel = false;


class Logger {
	constructor(data) {
		if(!data) return;

		this.server = data.server;
		this.logChannel = data.logChannel;
		this.bot = data.bot;
	}

	local(msg) {
		console.log(msg);
	}

	/**
	* Used for constant debug messages
	*/
	localDebug(msg) {
		console.log('[Debug] ' + msg);
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
