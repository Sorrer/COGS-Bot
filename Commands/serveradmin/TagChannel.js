module.exports = {

	description: {

		command: 'tagchannel',
		name: 'TagChannel',
		description: 'Tags a channel. If channel is not supplied, it will use current channel. Used with bot subsystems. For example tagging a channel with logchannel sets the channel as logchannel for the bot to output to. Also can tag categories.\n-- **Tags** --\n> logchannel - Channel that bot logs to\n> projects - (CATEGORY) Enables project creations. All main project channels will be put here.\n> projectlistings - Projects information will be posted by the bot here\n> archive - (CATEGORY) Any bot delete channels will be put here.\n> requests - Channel for changes in the discord, that the bot can not do.',
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
		const tag = data.params[0].toLowerCase();

		const logger = data.cache.logger;

		if(data.params.length == 2) {

			// Use supplied channelid
			let mentionChannel = message.mentions.channels.first();

			if(mentionChannel == null) {

				mentionChannel = message.guild.channels.resolve(data.params[1]);

				if(mentionChannel == null) {
					await message.reply('Could not find channel! Please use the id of the channel, or mention the channel as your second parameter');
					return;
				}

			}
			channelid = mentionChannel;
		}
		else{
			channelid = message.channel.id;
		}

		// Check if channel exists
		const channelCheck = message.guild.channels.resolve(channelid);
		channelid = message.guild.channels.resolveID(channelid);

		switch(tag) {
		case 'archive':
		case 'projects':
			if(channelCheck.type != 'category') {
				await message.reply('This tag requires the channel to be a category! Doing nothing.');
				return;
			}
		}

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
