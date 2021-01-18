module.exports = {

	description: {

		command: 'createchat',
		name: 'CreateChat',
		description: 'Create a text chat channel for your project. Default type is text. Optional types are *text* or *voice*',
		usage: 'createchat <channelname> <optional-type> - Create a project channel either *text* or *voice*.',
		category: 'Project Owner'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['user'],
		requireProjectOwner: true,
		requiredParams: 1,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		let type = 'text';
		if(data.params.length == 2) {
			const paramType = data.params[1].toLowerCase() ;
			if(paramType != 'text' && paramType != 'voice') {
				await data.message.reply('*' + paramType + '* is not a valid channel type! Please use either *text* or *voice*');
				return;
			}
			type = paramType;
		}


		const channel = await data.cache.projects.createChannel(data.params[0], data.userdata.currentproject.id, type);

		await data.message.reply('New project channel created! -> <#' + channel.id + '>');
	}
};
