module.exports = {

	description: {

		command: 'getpermissionbits',
		name: 'GetPermissionBits',
		description: 'Get the bits that represent the role id given. Can be used for bot invitiation',
		usage: 'getpermissionbits <roleid> - Get permission flags as bit',
		category: 'Admin'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['admin'],
		requireProjectOwner: false,
		requiredParams: 1,
		allowDM: false,
		onlyTestServer: true

	},

	execute: async function(data) {
		const roleid = data.params[0];

		const role = data.message.guild.roles.resolve(roleid);

		if(role == null) {
			data.message.reply('Invalid role ID');
			return;
		}

		data.cache.logger.dm(data.message.author.id, 'Permission bits for ' + role.name, role.permissions.bitfield, role.hexColor);
	}
};
