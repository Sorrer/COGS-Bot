module.exports = {

	description: {

		command: 'createproject',
		name: 'CreateProject',
		description: 'Starts the project creation task. Follow the prompts to use',
		usage: 'createproject - Starts project creation tasks.',
		category: 'AdminProject'

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

	execute: async function(data) {

		if(!data.cache.projects.enabled()) {
			await data.message.reply('Please tag a category via tagchannel command with the tag *projects*');
			return;
		}

		await data.message.reply('Starting creation process! What is the project name? (Cancel any task by saying c)');
		return module.exports.taskName;
	},

	taskName: async function(data, taskData) {
		taskData['name'] = data.message.content;
		await data.message.reply('Name is **' + taskData['name'] + '**. What is the description? (Cancel any task by saying c)');
		return module.exports.taskInfo;
	},

	taskInfo: async function(data, taskData) {
		taskData['description'] = data.message.content;
		await data.message.reply('Description is **' + taskData['description'] + '**. Who is the owner (ping the owner)? (Cancel any task by saying c)');
		return module.exports.taskOwner;
	},

	taskOwner: async function(data, taskData) {
		const user = data.message.mentions.users.first();

		if(user == null) {
			await data.message.reply('Could not find mentioned user. Please ping the owner! Who is the owner? (Cancel any task by saying c)');
			return module.exports.taskOwner;
		}


		taskData['ownerid'] = user.id;


		await data.message.reply('\nName is **' + taskData['name'] + '**\nDescription is **' + taskData['description'] + '**.\nOwner is **<@' + taskData['ownerid'] + '>**.\n\nDoes this sound good? Type *y* to finalize!');

		return module.exports.taskFinished;
	},

	taskFinished: async function(data, taskData) {
		if(data.message.content != 'y') {
			await data.message.reply('Cancled project creation.');
			return;
		}


		const returnData = await data.cache.projects.create(taskData['description'], taskData['name'], taskData['ownerid']);

		if(typeof (returnData) == 'number') {
			data.message.reply(`Project created! - ${returnData}`);
		}
		else{
			data.message.reply('Failed to create project - ' + returnData);
		}

	}
};
