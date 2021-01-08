module.exports = {

	description: {

		command: 'test',
		name: 'Test',
		description: 'This command is used as a template for future commands',
		usage: 'test <param1> <param2> <param3> - Param1 should be this. Param2 is this. Param3 is optional'

	},

	settings: {

		enabled: false,
		isTask: true,
		allowedUsage: ['admin', 'moderator', 'user', 3, 2, 1],
		requireProjectOwner: true,
		requiredParams: 2,
		allowDM: false,
		onlyTestServer: true

	},

	execute: async function(data) {

		if(module.exports.settings.isTask) {
			return module.exports.task;
		}

		if(data) {
			return data;
		}

	},

	task: async function(data) {
		if(data && data.tools.logger) {
			const logger = data.tools.logger;
			logger.log('Data works!');
		}
		return;
	},


	onMemberJoin: async function(data) {

		if(!data) {
			return null;
		}

		return 'OnMemberJoinDebugMessage';
	}
};
