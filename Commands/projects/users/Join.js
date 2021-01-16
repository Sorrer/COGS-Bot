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
			if(data.cache.projects.hasMember(id, data.author.id)) {
				await data.message.reply('Already part of project!');
				return;
			}
			await data.cache.projects.addMember(id, data.author.id);
		}
		else{
			await data.message.reply('Could not find project id!');
		}
	},

	onMemberJoin: async function(data) {
		let found = false;

		let projectTitles = '';


		const projectsResults = await data.cache.mysqlCon.query('SELECT projectid FROM cogsprojects.projects WHERE serverid = ?', [data.cache.serverid]);

		if(projectsResults.results[0] != null) {
			for(const result of projectsResults.results) {
				const project = await data.cache.projects.get(result.projectid);


				if(project.ownerid == data.member.id || project.memberids.includes(data.member.id)) {
					found = true;
					await data.cache.projects.addMember(project.id, data.member.id);
					projectTitles += '\'*' + project.title + '*\' ';
				}
			}
		}


		if(found) {
			return 'Projects joined: ' + projectTitles;
		}
	}
};
