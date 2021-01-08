module.exports = {

	description: {

		command: 'tagchannel',
		name: 'TagChannel',
		description: 'Tag a channel with the desired name. Used with bot subsystems. For example tagging a channel with logchannel sets the channel as logchannel for the bot to output to',
		usage: 'tagchannel <tag> [OPTIONAL]<channelid> - tags the specified channel, or current channel if not defined with supplied tag. You can use channel mentions.'

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

		const message = data.message;
		let channelid = null;
		const tag = data.params[0];
		if(data.params.length == 2) {

			// Use supplied channelid
			let mentionChannel = message.mentions.channels.first();

			if(mentionChannel == null) {

				mentionChannel = message.guild.resolve(data.params[1]);

				if(mentionChannel == null) {
					await message.reply('Could not find channel! Please use the id of the channel, or mention the channel as your second parameter');
					return;
				}

			}
			else{
				channelid = mentionChannel;
			}
		}
		else{
			channelid = message.channel.id;
		}

		// Check if channel exists
		const channelCheck = message.guild.channels.resolve(channelid);

		if(channelCheck != null) {
			data.cache.setChannel(tag, channelid);
		}
		else{
			await message.reply('Could not find channel! Please use the id of the channel, or mention the channel as your second parameter');
		}
	}
};
