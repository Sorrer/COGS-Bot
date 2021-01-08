module.exports = {

	description: {

		command: 'settestserver',
		name: 'SetTestServer',
		description: 'Sets the current server to the test server for the bot to test beta commands.',
		usage: 'settestserver <prefix> - Defines the server as a test server.',
		category: 'Bot Admin'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['botadmin'],
		requireProjectOwner: false,
		requiredParams: 0,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		data.cache.setSetting('istestserver', 1);
		data.message.reply('Server is now registered as a test server! Have fun debugging test commands');

		data.cache.logger.local('Warning! New test server set.' + ' <@' + data.message.author.id + '> set the server as a test server');
	}
};
