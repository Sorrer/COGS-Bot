module.exports = {

	description: {

		command: 'deleteproject',
		name: 'DeleteProject',
		description: 'Deletes the project. If an archive category is set, delete channels are placed into it.',
		usage: 'deleteproject - Deletes a specified project. Follow prompts',
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
		data.message.reply('What is the project id?');
		return module.exports.taskID;
	},

	taskID: async function(data, taskData) {
		const id = parseInt(data.message.content, 10);

		if(!await data.cache.projects.has(id)) {
			data.message.reply('Invalid project ID - ' + id + '. Deletion failed.');
			return;
		}

		taskData['projectid'] = id;

		const project = await data.cache.projects.get(id);
		data.message.reply('Going to delete **' + project.title + '**\nProject has ' + project.channelids.length + 2 + ' channels\nAre you sure? (y/n)');

		return module.exports.taskConfirmation;
	},

	taskConfirmation: async function(data, taskData) {

		if(data.message.content == 'y') {
			data.message.reply('Deleting project');
			await data.cache.projects.delete(taskData['projectid']);
			data.message.reply('Project delete');
		}

	}
};
