module.exports = {

	description: {

		command: 'setprefix',
		name: 'SetPrefix',
		description: 'Sets the commmand prefix. Default prefix is \';\'. Prefix can be anything, but pick a unique enough character to not be mistaken in normal typing',
		usage: 'setprefix <prefix> - Prefix to use before commands',
		category: 'Admin'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['admin'],
		requireProjectOwner: false,
		requiredParams: 1,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {

		if(data.params[0] == '') {
			data.message.channel.reply('That is not a valid prefix, please use a different one');
			return;
		}

		data.cache.setPrefix(data.params[0]);
		data.cache.logger.log('Command prefix changed.', 'New prefix is now ' + data.params[0]);
	}
};
