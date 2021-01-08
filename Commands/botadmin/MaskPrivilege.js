module.exports = {

	description: {

		command: 'maskprivilege',
		name: 'MaskPrivilege',
		description: 'Masks the users privilege with the desired number to test features. Use \'off\' to remove mask and go back to original privilege. Only works for bot admins.',
		usage: 'maskprivilege <privilege> - Defines the server as a test server.',
		category: 'Bot Admin'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['botadmin'],
		requireProjectOwner: false,
		requiredParams: 1,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		if(data.params[0] == 'off') {
			delete data.commander.mask[data.message.author.id];
			data.message.reply('Your mask is now off');
		}
		else{

			const privilegeCount = parseInt(data.params[0], 10);
			data.commander.mask[data.message.author.id] = privilegeCount;

			data.message.reply('You privilege is now set to ' + privilegeCount);
		}
	}
};
