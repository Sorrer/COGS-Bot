module.exports = {

	description: {

		command: 'changedescription',
		name: 'ChangeDescription',
		description: 'Change the description of the current project',
		usage: 'changedescription <description>- Change description of project',
		category: 'Project Owner'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['user'],
		requireProjectOwner: true,
		requiredParams: 0,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		const content = data.message.content;
		const description = content.substring(content.indexOf(' ') + 1);

		const oldDescription = data.userdata.currentproject.title;

		const response = await data.cache.projects.changeDescription(description, data.userdata.currentproject.id);


		if(response != true) {
			await data.message.reply('Failed to change description: *' + response + '*');
			return;
		}


		await data.message.reply('Old Description:\n*' + oldDescription + '*\nNew Description:\n*' + description + '*');

	}
};
