module.exports = {

	description: {

		// Used with a global prefix to execute this command
		// Try to figure out how to make prefixes per server, so someone can make a custom prefix anything like 'doThisCommand' command, or more perferably ';'
		command: 'test',

		// Printable name for this command
		name: 'Test',

		// Explain your command
		description: 'This command is used as a template for future commands',

		// Explain how the command should be used, free form on how to explain.
		usage: 'test <param1> <param2> <param3> - Param1 should be this. Param2 is this. Param3 is optional'

	},

	// Settings used by the command manager to figure out how this command should be executed
	settings: {

		// Allows the command to go through multiple stages of messages through one single channel. ]
		// If a message is recieved else where it will cancel this task.
		// Tasks also can be user-cancelled through typing the letter c (So be cautious with message detection)
		isTask: false,

		// Allow this command usage for these bot roles (not discord roles).
		// 'projectowner' is special. A message typed in a project channel that is owned by that user will be allowed to execute a command with this stance.
		// Having user defined with projectowner will still allow users to access this command.
		allowedUsage: ['admin', 'moderator', 'projectowner', 'user'],

		// How many parameters are required to execute this command. Player with will message with a warning of the usage description
		requireParams: 2,

		// If the player messages the bot directly, this command can handle that. DM commands will never have a prefix
		allowDM: false

	},

	execute: function(data) {

		// data's structure

		// data
		// - author
		// - params
		// - message
		// - tools
		//     - All tools provived by Commands (MysqlCon, Logger, etc)

		// Executes via commands

		// If this is a task, return
		return data;
	},

	task: function(data) {
		if(data && data.tools.logger) {
			const logger = data.tools.logger;
			logger.log('Data works!');
		}
		return;
	}
};
