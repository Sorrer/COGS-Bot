module.exports = {

	description: {

		command: 'setpermissionbits',
		name: 'SetPermissionBits',
		description: 'Set the bits that represent the role id given. Can be used for copying role permissions',
		usage: 'setpermissionbits <roleid> <bits> - Set permission flags with bits',
		category: 'Admin'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['admin'],
		requireProjectOwner: false,
		requiredParams: 2,
		allowDM: false,
		onlyTestServer: true

	},

	execute: async function(data) {
		const roleid = data.params[0];
		const bits = data.params[1];

		const role = data.message.guild.roles.resolve(roleid);

		if(role == null || role == undefined) {
			data.message.reply('Invalid role id');
			return;
		}

		role.permissions.bits = bits;

		data.cache.logger.log('Permission set with bits', '<@' + data.message.author.id + '> set permissions of role ' + role.name + '\nBits: ' + bits + '\n> ' + role.permissions.toArray());
	}
};
