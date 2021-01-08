const Discord = require('discord.js');

const fs = require('fs');


// Will be provided by what ever requires a log;

class Logger {
	constructor(data) {
		this.localPrefix = '';
		if(!data) return;

		if(fs.existsSync('logs')) {
			this.useLogs = true;
		}
		else{
			fs.mkdirSync('logs');
		}

		this.logFile = ('logs/' + data.server.id + '.log');
		this.server = data.server;
		this.logChannel = data.logChannel;
		this.bot = data.bot;
		this.localPrefix = data.prefix ? data.prefix : '[null]';

	}

	async setLogChannel(channelid) {
		if(this.server.id == null || this.bot == null) {
			this.localDebug('Tried to set log channel without having a server guild set or a bot. This should not happen!');
		}

		const server = await this.bot.guilds.fetch(this.server.id);

		if(server == null) {
			this.localErr('Can not find server for setting log channel', true);
		}

		const channel = server.channels.resolve(channelid);
		this.local('Log channel set - ' + channel.id);
		this.logChannel = channel;
	}

	getDateTime() {

		const date = new Date();

		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDate();

		let hour = date.getHours();
		hour = (hour < 10 ? '0' : '') + hour;

		let min = date.getMinutes();
		min = (min < 10 ? '0' : '') + min;

		let sec = date.getSeconds();
		sec = (sec < 10 ? '0' : '') + sec;

		return `[${year}-${month}-${day}][${hour}:${min}:${sec}]`;
	}


	saveLog(logMessage) {
		if(this.useLogs) {
			fs.appendFile(this.logFile, logMessage + '\n', function(err) {
				if(err) {
					console.log('Failed to log to file');
				}
			});
		}
	}

	local(msg) {
		const finalMsg = this.localPrefix + this.getDateTime() + ' ' + msg;
		console.log(finalMsg);
		this.saveLog(finalMsg);
	}

	/**
	* Used for constant debug messages
	*/
	localDebug(msg) {
		const finalMsg = this.localPrefix + this.getDateTime() + '[Debug]' + ' ' + msg;
		console.log(finalMsg);
		this.saveLog(finalMsg);
	}

	localErr(msg, stacktrace = false) {
		const errorMessage = '[Error]' + this.getDateTime() + ' ' + msg;

		if(stacktrace) {
			console.trace(errorMessage);
		}
		else{
			console.log(errorMessage);
		}


		this.saveLog(errorMessage);
	}

	log(title, msg, color = '#fffff') {
		this.saveLog(title);
		this.saveLog(msg);

		if(!this.logChannel) {
			console.log(title + color + '\n' + msg);
			return;
		}

		// Generate embeded and log
		const embed = this.generateMsg(title, msg, color);

		return this.logChannel.send(embed);
	}

	logErr(errMessage, details) {
		this.log(errMessage, details, '#f5425d');
	}

	dm(receiverID, title, msg, color = '#ffffff', channelid = null, channelmsg = null) {

		if(!this.bot) {
			this.localErr('Failed to send DM, no bot found');
			return;
		}

		const embed = this.generateMsg(title, msg, color);

		this.bot.users.fetch(receiverID).then((user) =>{
			user.send(embed);
		}).catch((error1) => {
			if(channelid != null) {
				this.bot.channels.fetch(channelid).then((channel) =>{
					if(channelmsg == null) {
						channel.send('Could not send DM message to you (<@' + receiverID + '>). Make sure you are accepting DM\'s').then((message) =>{
							setTimeout(() => {message.delete();}, 60000);
						});
					}
					else{
						channel.send(channelmsg);
					}
				}).catch((error2) => {
					this.localErr(error1);
					this.localErr(error2);
				});
			}
			else{
				this.localErr('No channel id provided, dm message went no where\n' + title + '\n' + msg, true);
			}
		});

		this.saveLog('UserDM (' + receiverID + ') - ' + title);
		this.saveLog(msg);
	}


	dmInvalidCommand(recieverID, theirMessage, msg, channelid = null, channelmsg = null) {
		this.dm(recieverID, 'Error: Invalid Command', '*> ' + theirMessage + '*\n' + msg, '#f5425d', channelid, channelmsg);
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
