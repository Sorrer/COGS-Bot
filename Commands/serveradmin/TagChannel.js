module.exports = {

	description: {

		command: 'tagchannel',
		name: 'TagChannel',
		description: 'Tags a channel. If channel is not supplied, it will use current channel. Used with bot subsystems. For example tagging a channel with logchannel sets the channel as logchannel for the bot to output to',
		usage: 'tagchannel <tag> <channelid> - tags the specified channel with specific tag.',
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

		const message = data.message;
		let channelid = null;
		const tag = data.params[0];

		const logger = data.cache.logger;

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
			channelid = message.channel.id.id;
		}

		// Check if channel exists
		const channelCheck = message.guild.channels.resolve(channelid);
		channelid = message.guild.channels.resolveID(channelid);

		if(channelCheck != null) {
			await data.cache.setChannel(tag, channelid);
			await message.reply('Channel <#' + channelid + '> set as ' + tag + '!');
			await logger.log('Channel tag set', `<@${data.message.author.id}> set the tag for the channel <#${channelid}> as '${tag}'`);
		}
		else{
			await message.reply('Could not find channel! Please use the id of the channel, or mention the channel as your second parameter');
		}
	}
};
