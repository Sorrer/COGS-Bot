const walkSync = require('walk-sync');


class Commands {


	constructor(commands_folder, logger) {
		this.commands_folder = commands_folder;
		this.commands = [];
		this.memberJoinCommands = [];

		this.logger = logger;

		this.taskQueue = {};

		this.mask = {};

	}

	load() {
		this.walkCommands(this.commands_folder);

		// Categorize commands

		this.commandsCategorized = {};

		for(const commandKey in this.commands) {

			const category = this.commands[commandKey].description.category;

			if(this.commandsCategorized[category] == null) {
				this.commandsCategorized[category] = [];
			}

			this.commandsCategorized[category].push(this.commands[commandKey]);
		}


		let loadedCommandNames = '';
		let loadedMemberJoinCommandNames = '';

		for(const command in this.commands) {
			loadedCommandNames += command + ', ';
		}

		for(const command of this.memberJoinCommands) {
			loadedMemberJoinCommandNames += command.description.name + ', ';
		}


		this.logger.local('Commands Loaded: ' + loadedCommandNames.replace(new RegExp(', $'), ''));
		this.logger.local('Member Join Commands Loaded: ' + loadedMemberJoinCommandNames.replace(new RegExp(', $'), ''));
	}

	walkCommands(dir) {
		const commandPaths = walkSync(dir, { directories: false });

		for(const path of commandPaths) {
			try{
				this.loadCommand('../' + this.commands_folder + '/' + path);
			}
			catch(e) {
				this.logger.localErr('Command Invalid. Couldn\'t find file or file error.\n' + e, true);
			}
		}

	}

	loadCommand(filePath) {
		this.logger.local(`Grabbing Command: '${filePath}'`);
		const command = require(filePath);

		this.logger.local(`Verifying Command '${filePath}'`);
		const verified = this.verifyCommand(command);

		if(!verified) {
			this.logger.localErr(`Failed to verify command '${filePath}'`);
			return;
		}

		if(command.settings.enabled !== true) {
			this.logger.local('Ignoring command, not enabled');
			return;
		}

		this.logger.local(`Loading Command: '${command.description.name}'`);

		// Find lowest privilege to execute command
		// Max safe integer is bot admin;
		const privileges = [Number.MAX_SAFE_INTEGER];

		for(const role of command.settings.allowedUsage) {
			if(typeof (role) == 'number') {
				privileges.push(parseInt(role, 10));
			}
			else{
				switch(role) {
				case 'botadmin':
					privileges.push(Number.MAX_SAFE_INTEGER);
					break;
				case 'admin':
					privileges.push(100);
					break;
				case 'moderator':
					privileges.push(50);
					break;
				case 'user':
					privileges.push(0);
					break;
				}
			}
		}

		command.settings.privilege = Math.min(...privileges);
		this.logger.local('Command privilege: ' + command.settings.privilege);


		if(command.onMemberJoin && typeof (command.onMemberJoin) == 'function') {
			this.memberJoinCommands.push(command);
		}

		this.commands[command.description.command] = command;


		this.logger.local(`Successfully loaded command: '${command.description.name}'\n`);

	}

	verifyCommand(command) {
		if(!command.settings) {
			this.logger.localErr('Failed to verify command - No settings found');
			return false;
		}
		else{
			const settings = command.settings;
			const errDescription = 'Failed to verify command settings - ';

			let settingsFailed = false;

			if(!settings.allowedUsage) {
				settingsFailed = true;
				this.logger.localErr(errDescription + ' usage not set. ');
			}
			else if(!Array.isArray(settings.allowedUsage)) {
				settingsFailed = true;
				this.logger.localErr(errDescription + ' usage not array. ');
			}


			if(settingsFailed) {
				return false;
			}

		}

		if(!command.description) {
			this.logger.localErr('Failed to verify command - No description found');
			return false;
		}
		else{
			const description = command.description;
			const errDescription = 'Failed to verify command descrption - ';

			let descriptionFailed = false;

			if(!description.command) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' command not set. ');
			}
			else if(typeof (description.command) != 'string') {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' command not a string. ');
			}

			if(!description.name) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' name not set. ');
			}
			else if(typeof (description.name) != 'string') {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' name not a string. ');
			}

			if(!description.description) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' description not set. ');
			}
			else if(typeof (description.description) != 'string') {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' description not a string. ');
			}

			if(!description.usage) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' usage not set. ');
			}
			else if(typeof (description.usage) != 'string') {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' usage not a string. ');
			}

			if(descriptionFailed) {
				return false;
			}
		}

		for(const otherCommand of this.commands) {
			if(otherCommand.description.command == command.description.command) {
				this.logger.localErr('Failed to verify command - Duplicate command name found!' + command.description.command);
				return false;
			}
		}


		if(!command.execute) {
			this.logger.localErr('Failed to verify command - No execute function found');
			return false;
		}

		return true;
	}


	addTask(clientID, channelID, function_, command, data = {}) {
		if(this.taskQueue[clientID] != null) {
			clearTimeout(this.taskQueue[clientID].timeout);
			delete this.taskQueue[clientID];
		}

		this.taskQueue[clientID] = { id: clientID, channel_id: channelID, execute: function_, command: command, data: data, persistant_data: {} };
		this.logger.localDebug(`Added new task for ${command.description.name}. ClientID - ${clientID}. ChannelID - ${channelID}`);

		// Removes tasks after 5 minutes.
		this.taskQueue[clientID].timeout = setTimeout(() => delete this.taskQueue[clientID], 300000);
	}

	hasTask(clientID) {
		return this.taskQueue[clientID] != null;
	}

	async handleTask(clientID, message, data) {

		const task = this.taskQueue[clientID];

		if(task) {
			let moreTasks = false;

			try{
				if(message.content.toLowerCase() != 'c') {
					if(task.command.settings.allowDM == (message.channel.type == 'dm') || message.channel.id == task.channel_id) {
						moreTasks = await task.execute(data, task.persistant_data);
					}
				}
				else{
					message.reply('Canceled');
				}
			}
			catch(e) {
				this.logger.localErr('Failed to execute task');
				this.logger.localErr(e, true);
			}

			// Handle the continuation of the task command if needed
			if(moreTasks && typeof (moreTasks) == 'function') {
				task.execute = moreTasks;
			}
			else{
				delete this.taskQueue[clientID];
			}

			return true;
		}


		return false;

	}

	async execute(serverCache, message, userData, bot) {


		const params = message.content.split(' ');

		let commandName = params[0];
		params.splice(0, 1);

		// If there was no server cache found or supplied, set the default values;
		if(serverCache == null) {
			serverCache = {
				prefix: ';',
				logger: this.logger
			};
		}

		const data = {
			author: message.author,
			bot: bot,
			cache: serverCache,
			commands: this.commands,
			commandscategorized: this.commandsCategorized,
			commandname: commandName,
			message: message,
			params: params,
			userdata: userData
		};

		if(userData.privilege == Number.MAX_SAFE_INTEGER) {
			data.commander = this;
		}

		// console.log(this.mask);

		if(this.mask[message.author.id] != null) {
			data.userdata.privilege = this.mask[message.author.id];
			userData = data.userdata;
		}

		// Make sure no task is active for user, if so do it and break
		if(await this.handleTask(message.author.id, message, data)) {
			return;
		}

		if(!commandName.startsWith(serverCache.prefix)) return;
		commandName = commandName.substring(serverCache.prefix.length);


		// Find a command and execute it if every requirement is fulfilled
		const isDM = message.channel.type == 'dm';

		const command = this.commands[commandName];

		if(command == null) {
			return;
		}

		const description = command.description;
		const settings = command.settings;

		if(description.command.toLowerCase() !== commandName.toLowerCase()) {
			return;
		}

		if(settings.privilege > userData.privilege && data.commander == null && description.name != 'maskprivilege') {
			return;
		}

		if(params.length < settings.requiredParams) {
			const invalidMessage = 'Usage - ' + serverCache.prefix + description.usage;
			serverCache.logger.dmInvalidCommand(message.author.id, message.content, invalidMessage, message.channel.id, invalidMessage);
			return;
		}

		if(isDM && !settings.allowDM) {
			serverCache.logger.dmInvalidCommand(message.author.id, message.content, 'This command does not allow DM\'s please use it on a server!');
			return;
		}

		if(settings.requireProjectOwner === true && !userData.ownsProject) {
			const invalidMessage = 'You have to own a project to use this command';
			serverCache.logger.dmInvalidCommand(message.author.id, message.content, invalidMessage, message.channel.id, invalidMessage, message.channinvalidMessage);
			return;
		}

		if(settings.onlyTestServer === true && typeof (serverCache.getSetting) == 'function' && !serverCache.getSetting('istestserver')) {
			return;
		}


		// Command identity matches to the one that is trying to executed, execute the command.
		try{

			const executeReturn = await command.execute(data);

			if(settings.isTask == true) {
				if(typeof executeReturn == 'function') {
					this.addTask(message.author.id, message.channel.id, executeReturn, command);
				}
			}

		}
		catch(e) {
			if(typeof (serverCache.getSetting) == 'function' && serverCache.getSetting('istestserver')) {
				serverCache.logger.logErr('Failed to execute command: ' + description.name, e);
			}
			serverCache.logger.localErr('Failed to execute command: ' + description.name, false);
			serverCache.logger.localErr(e);

			// Get right to the problem
			console.log(e);

			try{
				message.channel.send('> Internal Server Error');
			}
			catch(d) {
				this.logger.localErr('Failed to send internal server error message: ' + serverCache.serverGuild);
				this.logger.localErr(d);
				return false;
			}

			return false;
		}

		return true;

	}

	async memberJoinEvent(data) {
		const outputArr = [];

		for(const command of this.memberJoinCommands) {

			try{
				const output = command.onMemberJoin(data);
				if(output != null) outputArr.push(output);
			}
			catch(e) {
				try{
					this.logger.logError('Failed to execute memberJoin callback', 'Callback: (' + command.description.name + ')\n' + e);
				}
				catch(d) {
					this.logger.localErr('Failed to send error to server for callback' + command.decsription.name) + '\n' + e;
				}
			}
		}

		let outputStr = '';

		for(const output of outputArr) {
			outputStr += '> ' + output + '\n';
		}

		this.logger.log('Member Joined - ' + data.member.user.username, 'Commands executed: \n' + outputStr, '#16c98d');
	}
}


module.exports = Commands;
