const CommandManager = require('./CogsLib/Commands.js');
const Logger = require('./CogsLib/Logger.js');
const Discord = require('discord.js');
const MysqlHandler = require('./CogsLib/MysqlHandler.js');

const config = require('./config.json');

const logger = new Logger({ server: { id: 'test' } });
// const bot = new Discord.Client();

const command = new CommandManager('./Commands', logger);


// TODO: Add mysql functionality
// TODO: Add servercaching system. Each server has its own serverCache that can be reloaded and loaded. Have a system that detects what serverCache to used based on discord message. If the message is a DM use default functionality


// Mysql Handler
const mysqlHandler = new MysqlHandler(config.mysql, logger);


// Verifier

const Verifier = require ('./CogsLib/rutgers-verification.js');

let nodemail = null, sendgrid = null;

if(config.email.sendGrid.api_key) {
	sendgrid = config.email.sendGrid.api_key;
}
else{
	nodemail = config.email.nodemailer;
}

const Verification = new Verifier(mysqlHandler, nodemail, sendgrid);


// TestVerifier.sendVerification('alx3', 654321);

async function Initiate() {
	await mysqlHandler.init();
	logger.local('Connected to MYSQL');
	Verification.mysqlHandler = mysqlHandler;

	logger.local(Verification.startVerification('123', 'alx3'));

	const response = await askQuestion('Enter verification code');

	logger.local(Verification.verify('123', 'alx3', response));

	command.load();
}


const readline = require('readline');

function askQuestion(query) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise(resolve => rl.question(query, ans => {
		rl.close();
		resolve(ans);
	}));
}

Initiate();
