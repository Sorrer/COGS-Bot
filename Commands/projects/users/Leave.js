module.exports = {

	description: {

		command: 'leave',
		name: 'Leave',
		description: 'Leave a project via its id',
		usage: 'leave <projectid> - Leave a project',
		category: 'Project'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['user'],
		requireProjectOwner: false,
		requiredParams: 1,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		const id = parseInt(data.params[0], 10);
		if(await data.cache.projects.has(id)) {
			const project = await data.cache.projects.get(id);


			if(project.ownerid == data.author.id) {
				data.message.reply('Cannot leave a project that you own!');
				return;
			}

			if(!project.memberids.includes(data.author.id)) {
				data.message.reply('You are not in that project');
				return;
			}

			await data.cache.projects.removeMember(id, data.author.id);
		}
		else{
			await data.message.reply('Could not find project id!');
		}
	}
};
