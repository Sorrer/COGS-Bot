const CommandManager = require('./CogsLib/Commands.js');
const Logger = require('./CogsLib/Logger.js');

const command = new CommandManager('./Commands', new Logger());

command.load();
