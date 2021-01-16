module.exports = {

	description: {

		command: 'join',
		name: 'Join',
		description: 'Join a project via its id',
		usage: 'join <projectid> - Join a project',
		category: 'Project'

	},

	settings: {

		enabled: true,
		isTask: false,
		allowedUsage: ['user'],
		requireProjectOwner: false,
		requiredParams: 0,
		allowDM: false,
		onlyTestServer: false

	},

	execute: async function(data) {
		const requiredPrivilege = data.cache.getSetting('projectprivilege');
		if(requiredPrivilege != null) {
			if(data.userdata.privilege < requiredPrivilege) {
				return;
			}
		}


		const id = parseInt(data.params[0], 10);
		if(await data.cache.projects.has(id)) {
			await data.cache.projects.addMember(id, data.author.id);
		}
		else{
			data.message.reply('Could not find project id!');
		}
	},

	onMemberJoin: async function(data) {
		let found = false;

		let projectTitles = '';

		for(const project of data.cache.projects.projects) {
			if(project.ownerid == data.member.id || project.memberids.includes(data.member.id)) {
				found = true;
				data.cache.projects.addMember(project.id, data.member.id);
				projectTitles += '\'*' + project.title + '*\' ';
			}
		}


		if(found) {
			return 'Projects joined: ' + projectTitles;
		}
	}
};
