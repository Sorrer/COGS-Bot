module.exports = {

	description: {

		command: 'help',
		name: 'Help',
		description: 'Prints all the commands, and can be used to show command explanations if it is supplied',
		usage: 'help <command> - Shows all available commands'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['user'],
		requireProjectOwner: false,
		requiredParams: 0,
		allowDM: true,
		onlyTestServer: false

	},

	execute: async function(data) {
		// Create embeded help and try to DM to user, if dm fails use the rebound feature to channel

		if(data.params.length > 0) {
			let helpString = '';
			let commandName = false;
			for(const category in data.commandscategorized) {
				for(const command of data.commandscategorized[category]) {
					if(command.description.command === data.params[0].toLowerCase() || command.description.name == data.params[0]) {
						if(module.exports.hasPrivilege(data, command)) {

							if(command.settings.onlyTestServer && (data.cache.getSetting && !data.cache.getSetting('istestserver'))) {
								continue;
							}

							helpString = command.description.usage + '\n' + '> ' + data.cache.prefix + command.description.description;
							commandName = command.description.name;
						}
						break;
					}
				}
			}


			if(commandName === false) {

				const content = data.message.content;
				const userCategory = content.substring(content.indexOf(' ') + 1);
				for(const category in data.commandscategorized) {
					if(category == userCategory) {


						let helpCommandsString = '';
						for(const command of data.commandscategorized[category]) {
							if(module.exports.hasPrivilege(data, command)) {
								if(command.settings.onlyTestServer && (data.cache.getSetting && !data.cache.getSetting('istestserver'))) {
									continue;
								}
								helpCommandsString += '> ' + data.cache.prefix + command.description.usage + '\n';
								// console.log(helpCommandsString);
							}
						}

						if(category != '' && category != null && category != undefined && category != 'undefined') {
							if(helpCommandsString != '') {
								helpString += '**' + category + '**\n';
							}
						}
						helpString += helpCommandsString;

						const embededmsg = data.cache.logger.generateMsg('Help - ' + data.params[0], helpString, '#88519e');
						data.message.channel.send(embededmsg);

						return;
					}
				}

				const embededmsg = data.cache.logger.generateMsg('Help - ' + data.params[0] + ' Command/Category', 'Command/Category not found', '#b8002f');

				data.message.channel.send(embededmsg);

				return;
			}

			const embededmsg = data.cache.logger.generateMsg('Help - ' + commandName + ' Command', helpString, '#88519e');

			data.message.channel.send(embededmsg);

			return;

		}

		let helpString = '';

		for(const category in data.commandscategorized) {
			let helpCommandsString = '';
			for(const command of data.commandscategorized[category]) {
				if(module.exports.hasPrivilege(data, command)) {
					if(command.settings.onlyTestServer && (data.cache.getSetting && !data.cache.getSetting('istestserver'))) {
						continue;
					}
					helpCommandsString += '> ' + data.cache.prefix + command.description.usage + '\n';
					// console.log(helpCommandsString);
				}
			}

			if(category != '' && category != null && category != undefined && category != 'undefined') {
				if(helpCommandsString != '') {
					helpString += '**' + category + '**\n';
				}
			}
			helpString += helpCommandsString;

			helpString += '\n';
		}

		helpString = helpString.replace(new RegExp('\n$'), '');

		const embededmsg = data.cache.logger.generateMsg('Help - Command List', helpString, '#88519e');

		data.message.channel.send(embededmsg);


	},

	hasPrivilege: function(data, command) {
		if(command.requireProjectOwner && !data.userdata.ownsproject) return false;
		if(command.category == 'Project' && data.cache && data.userdata.privilege < data.cache.getSetting('projectprivilege')) return false;
		if(data.userdata.privilege < command.settings.privilege) return false;
		return true;
	}
};
