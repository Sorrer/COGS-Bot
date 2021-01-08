module.exports = {

	description: {

		command: 'copypermissions',
		name: 'CopyPermissions',
		description: 'Copies permisions from one role to another role.',
		usage: 'getpermissionbits <from> <to> - Copys permissions from role to role',
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
		const fromRoleID = data.params[0];
		const toRoleID = data.params[1];

		const fromRole = data.message.guild.roles.resolve(fromRoleID);
		const toRole = data.message.guild.roles.resolve(toRoleID);

		if(fromRole == null || toRole == null) {
			data.message.reply('Invalid ' + fromRole == null ? 'from' : 'to' + ' role id');
			return;
		}

		toRole.permissions = fromRole.permissions;
		data.cache.logger.log('Permissions copied between roles', '<@' + data.message.author.id + '> copied role permissions of ' + fromRole.name + ' to ' + toRole.name);
		data.message.reply(`Permissions copied successfully from ${fromRole.name} to ${toRole.name}`);
	}
};
