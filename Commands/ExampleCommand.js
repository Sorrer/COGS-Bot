module.exports = {

	description: {

		// Used with a global prefix to execute this command
		// Try to figure out how to make prefixes per server, so someone can make a custom prefix anything like 'doThisCommand' command, or more perferably ';'
		// Command names are always lowercase
		command: 'test',

		// Printable name for this command
		name: 'Test',

		// Explain your command
		description: 'This command is used as a template for future commands',

		// Explain how the command should be used, free form on how to explain.
		usage: 'test <param1> <param2> <param3> - Param1 should be this. Param2 is this. Param3 is optional',

		// Optional description field to set where this command will be placed in the help list
		category: 'Example'

	},

	// Settings used by the command manager to figure out how this command should be executed
	settings: {


		// The command loader will ignore this command unless enabled is set to true.
		enabled: false,

		// Allows the command to go through multiple stages of messages through one single channel. ]
		// If a message is recieved else where it will cancel this task.
		// Tasks also can be user-cancelled through typing the letter c (So be cautious with message detection)
		isTask: true,

		// Allow this command usage for these bot roles (not discord roles)
		// 'admin' is redudent, but it is good to show that admins can use this command. All commands will be accessible by admins.
		// Usage can also go by privilege value, anything that has a greater value than the privilege specified will be able to use the command. Base privilege is 0 for everyone
		// allowedUsage will be converted to the following privilege values after loading, so modifying will result in no changes.
		// botadmin - MAX SAFE INTEGER privilege
		// admin = 100 privilage
		// moderation = 50 privilage
		// user = 0 privilage

		allowedUsage: ['admin', 'moderator', 'user', 3, 2, 1],

		// Command will only execute if the user is a project owner typing in their project chat.
		requireProjectOwner: true,

		// How many parameters are required to execute this command. Player with will message with a warning of the usage description
		// Ignored if isTask = true
		// If this field is not set, it will default to 0
		requiredParams: 2,

		// If the player messages the bot directly, this command can handle that. DM commands will never have a prefix
		// If not defined, default will be false
		allowDM: false,


		// Optional parameters

		// This command will only execute on test server, for testing purposes
		onlyTestServer: true
	},

	execute: async function(data) {

		// data's structure

		// data
		// - author
		// - params
		// - message
		// - bot
		// - userdata (User data provided to the commands function)
		//		- projectid (If this is )
		// - cache
		//     - All tools provived by Commands (MysqlCon, Logger, etc) for specified server

		// Executes via Commands.js

		// If this is a task, return task
		if(module.exports.settings.isTask) {
			return module.exports.task;
		}

		if(data) {
			return data;
		}

	},

	task: async function(data, taskData) {
		if(data && data.tools.logger) {
			const logger = data.tools.logger;
			logger.log('Data works!');
		}
		return taskData;
	},


	onMemberJoin: async function(data) {

		// data
		// - cache
		// - member (GuildMember)

		if(!data) {
			// Return null to not have any messages pushed out to log
			return null;
		}

		return 'OnMemberJoinDebugMessage';
	}
};
