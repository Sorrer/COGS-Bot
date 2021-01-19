const Discord = require('discord.js');

module.exports = {

	description: {

		command: 'embed',
		name: 'embed',
		description: 'Generates a embed in the channel the command was executed in.',
		usage: 'embed - Starts embed generation task',
		category: 'Admin'

	},

	settings: {

		enabled: true,
		isTask: true,
		allowedUsage: ['admin'],
		requireProjectOwner: false,
		requiredParams: 0,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data, taskData) {
		taskData.messages = [];

		taskData.messages.push(await data.message.reply('What is the title of this new embed?'));
		await data.message.delete();
		return module.exports.taskTitle;
	},

	taskTitle: async function(data, taskData) {
		taskData.embed = new Discord.MessageEmbed();

		taskData.embed.setTitle(data.message.content);

		await taskData.messages[taskData.messages.length - 1].delete();
		taskData.messages.splice(taskData.messages.length - 1, 1);

		taskData.messages.push(await data.message.reply('What is the description?'));
		await data.message.delete();
		return module.exports.taskExtra;
	},

	taskExtra: async function(data, taskData) {
		taskData.embed.setDescription(data.message.content);

		if(taskData.embedMessage == null) {
			taskData.embedMessage = await data.message.channel.send(taskData.embed);

			await taskData.messages[taskData.messages.length - 1].delete();
			taskData.messages.splice(taskData.messages.length - 1, 1);
			taskData.messages.push(await data.message.reply('Is there any other parts of the embed you would like to change? If not say finished\n*(image,footer,timestamp,thumbnail,color,title,description)*'));
		}
		else {
			taskData.embedMessage.edit(taskData.embed);
		}

		await data.message.delete();

		return module.exports.taskExtraTest;

	},

	taskExtraTest: async function(data, taskData) {
		const type = data.message.content;
		taskData.extraType = type;

		if(taskData.extraMessage != null) {
			await taskData.extraMessage.delete();
		}
		await data.message.delete();
		switch(type) {
		case 'image':
			taskData.extraMessage = await data.message.reply('Please paste the url');
			break;
		case 'footer':
			taskData.extraMessage = await data.message.reply('Please type footer');
			break;
		case 'thumbnail':
			taskData.extraMessage = await data.message.reply('Please paste the url');
			break;
		case 'color':
			taskData.extraMessage = await data.message.reply('Please type color hex value (#)');
			break;
		case 'title':
			taskData.extraMessage = await data.message.reply('Please type title');
			break;
		case 'description':
			taskData.extraMessage = await data.message.reply('Please type description');
			break;

		case 'timestamp':
			taskData.extraMessage = await data.message.reply('Timestamp set');
			taskData.embed.setTimestamp();
			return module.exports.taskExtraTest;
		case 'finished':
			module.exports.taskFinished(data, taskData);
			return;
		default:
			taskData.messages.push(await data.message.reply('Invalid part'));
			return module.exports.taskExtraTest;
		}

		return module.exports.taskExtraFinished;
	},

	taskExtraFinished: async function(data, taskData) {
		await taskData.extraMessage.delete();
		taskData.extraMessage = null;

		switch(taskData.extraType) {
		case 'image':
			taskData.embed.setImage(data.message.content);
			break;
		case 'footer':
			taskData.embed.setFooter(data.message.content);
			break;
		case 'thumbnail':
			taskData.embed.setThumbnail(data.message.content);
			break;
		case 'color':
			try{
				taskData.embed.setColor(data.message.content);
			}
			catch(e) {
				await data.cache.logger.localErr('Failed to set color ' + e);
			}
			break;
		case 'title':
			taskData.embed.setTitle(data.message.content);
			break;
		case 'description':

			taskData.embed.setDescription(data.message.content);
			break;

		}
		await taskData.embedMessage.edit(taskData.embed);
		await data.message.delete();
		return module.exports.taskExtraTest;
	},

	taskFinished: async function(data, taskData) {
		// Cleanup

		for(const message of taskData.messages) {
			await message.delete();
		}
		taskData.messages = [];

		await taskData.embedMessage.delete();
		data.message.channel.send(taskData.embed);

		await data.cache.logger.log('New Embed Generated', data.author.id + ' generated a new embed in <#' + data.message.channel.id + '>');
	}

	// TODO: Add extra features where you can set specific parts of the embed
};
