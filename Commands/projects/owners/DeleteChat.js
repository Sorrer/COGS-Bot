module.exports = {

	description: {

		command: 'deletechat',
		name: 'DeleteChat',
		description: 'Deletes a project channel. Inorder to get the channel id. Make sure you have discord debug/developer mode on, and then right click on the channel and press copy id. Paste the id after the command',
		usage: 'deletechat <channel> - Deletes channel. Either mentioned or its channel id.',
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
		const mentionedChannel = data.message.mentions.channels.first();
		let channel = null;

		if(mentionedChannel == null) {
			channel = data.message.guild.channels.resolve(data.params[0]);
		}
		else{
			channel = data.message.guild.channels.resolve(mentionedChannel);
		}


		const response = await data.cache.projects.deleteChannel(channel.id, data.userdata.currentproject.id);

		if(response != true) {
			await data.message.reply('Failed to delete channel! ' + response);
			return;
		}

		await data.message.reply('Deleted channel ' + channel.name);
	}
};
