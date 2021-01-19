module.exports = {

	description: {

		command: 'changetitle',
		name: 'ChangeTitle',
		description: 'Change the title to given name',
		usage: 'changetitle <channelname>- Create a project channel either *text* or *voice*.',
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
		const title = content.substring(content.indexOf(' ') + 1);

		const lastTitle = data.userdata.currentproject.title;

		const response = await data.cache.projects.changeTitle(title, data.userdata.currentproject.id);


		if(response != true) {
			await data.message.reply('Failed to change title: *' + response + '*');
			return;
		}

		await data.message.reply('Title is now: *' + title + '*.\nNote - Due to discord limitations, you will either need to wait/contact an admin to change category and channel names');

		await data.cache.logger.request('Project needs title changed!', 'Project **' + lastTitle + '** needs to be changed to **' + title + '**');
	}
};
