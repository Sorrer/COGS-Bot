module.exports = {

	description: {

		command: 'setrole',
		name: 'SetRole',
		description: 'Sets the privilege of the role given. Role can be it\'s id or mentioned.\n Privilege has to be below 999. Admin commands require 100 privilege. Moderator commands require 50 privilege. User commands require 0 privilege. You can set negative privilege for @ everyone to lock out those who don\'t have a role',
		usage: 'setrole <role> <privilege> - Sets privilege of role given.',
		category: 'Admin'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['admin'],
		requireProjectOwner: false,
		requiredParams: 2,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		const roleParam = data.params[0];
		const privilege = parseInt(data.params[1], 10);

		if(typeof (privilege) != 'number') {
			data.cache.logger.dmInvalidCommand(data.message.author.id, data.message.content, 'Invalid Privilege Number. Check for double space.', data.message.channel.id);
			return;
		}

		if(privilege >= 1000) {
			data.cache.logger.dmInvalidCommand(data.message.author.id, data.message.content, 'Invalid Privilege Number. Must be lower than 1000', data.message.channel.id);
			return;
		}

		let role = data.message.mentions.roles.first();


		if(role == null) {

			role = data.message.guild.resolve(roleParam);

			if(role == null) {
				await data.message.reply('Invalid role id/mention given! Please use the id or @ mention the role');
				return;
			}

		}

		data.cache.setRole(role.id, privilege);
		data.message.reply('New privilege of ' + privilege + ' set to role ' + role.name);
		data.cache.logger.log('Role privilege set', 'New privilege for ' + role.name + ' set to ' + privilege);
	}
};
