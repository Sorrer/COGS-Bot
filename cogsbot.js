const CommandManager = require('./CogsLib/Commands.js');
const Logger = require('./CogsLib/Logger.js');
const Discord = require('discord.js');
const MysqlHandler = require('./CogsLib/MysqlHandler.js');

const ServerCacheManager = require('./CogsLib/ServerCache/ServerCacheManager.js');

const config = require('./config.json');

const logger = new Logger({ server: { id: 'test' } });
// const bot = new Discord.Client();

const commandManager = new CommandManager('./Commands', logger);


// Mysql Handler
const mysqlHandler = new MysqlHandler(config.mysql, logger);


// Discord ClientID
const client = new Discord.Client();

// Verifier

const Verifier = require ('./CogsLib/rutgers-verification.js');

let nodemail = null, sendgrid = null, serverCacheManager = null;

if(config.email.sendGrid.api_key) {
	sendgrid = config.email.sendGrid.api_key;
}
else{
	nodemail = config.email.nodemailer;
}

const Verification = new Verifier(mysqlHandler, nodemail, sendgrid);


// TestVerifier.sendVerification('alx3', 654321);

async function Initiate() {
	logger.localPrefix = '[main]';
	logger.server = { id: 'main' };
	logger.bot = client;

	await mysqlHandler.init();
	logger.local('Connected to MYSQL');
	Verification.mysqlHandler = mysqlHandler;


	await client.login(config.bot.token);
	serverCacheManager = new ServerCacheManager(mysqlHandler, logger, client);
	await serverCacheManager.loadAll();

	console.log('Trying to get');

	// console.log(await serverCacheManager.get('100'));
	// console.log(await serverCacheManager.get('100'));

	commandManager.load();
}


client.on('ready', function() {
	logger.local('Bot connected');
});

client.on('message', async function(message) {


	if(message.channel.type == 'text') {

		const serverCache = await serverCacheManager.get(message.channel.guild.id);

		if(!message.content.startsWith(serverCache.prefix)) return;
		// TODO: Get user data from database

		const userdata = {};

		if(config.discord.admins.includes(message.author.id)) {
			userdata.privilege = Number.MAX_SAFE_INTEGER;
		}
		else{
			const roles = message.member.roles.cache.array();
			const roleids = [];
			for(const role of roles) {
				roleids.push(role.id);
			}

			if(roleids.length === 0) {
				userdata.privilege = 0;
			}
			else{
				userdata.privilege = Math.max(...roleids);
			}
		}


		if(serverCache.getSetting('projectsenabled') == 1) {
		// TODO: Check if user is project owner via cache, set userdata.
		}

		commandManager.execute(serverCache, message, userdata, client);

		if(serverCache.getSetting('deleteinvoke') === 1) {
			message.delete();
		}
	}
	else{
		const userdata = { privilege: 0 };
		if(config.discord.admins.includes(message.author.id)) {
			userdata.privilege = Number.MAX_SAFE_INTEGER;
		}
		commandManager.execute(null, message, userdata, client);
	}

	// Check if the server should delete messages when a command is executed.

});

client.on('guildMemberAdd', async function(member) {
	const serverCache = await serverCacheManager.get(member.guild.id);

	await commandManager.memberJoinEvent({ cache: serverCache });
});


Initiate();
