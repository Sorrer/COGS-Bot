const CommandManager = require('./CogsLib/Commands.js');
const Logger = require('./CogsLib/Logger.js');
const Discord = require('discord.js');
const MysqlHandler = require('./CogsLib/MysqlHandler.js');
const ms = require('ms')

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


client.on('ready', async () => {

 
	const arrayOfStatus = ["Coding Actually Good FPS", "Browsing stackoverflow","Trying to use Unreal","Developing the next Hottest game","Turning off and on", "No bugs, only features"]

	let index = 0;
    setInterval(() => {
        if (index == arrayOfStatus.length) index = 0;
        const status = arrayOfStatus[index];
        client.user.setActivity(status);
        index++;
    }, ms("15 Minutes"));






	logger.local('Bot connected');
});

client.on('message', async function(message) {


	if(message.channel.type == 'text') {

		const serverCache = await serverCacheManager.get(message.channel.guild.id);

		if(!message.content.startsWith(serverCache.prefix) && !commandManager.hasTask(message.author.id)) return;

		const userdata = {};

		if(config.discord.admins.includes(message.author.id)) {
			userdata.privilege = Number.MAX_SAFE_INTEGER;
			userdata.isadmin = true;
		}
		else {


			const roles = message.member.roles.cache.array();

			const rolePrivilegeAmounts = [];

			if(message.guild.ownerID === message.author.id) {
				rolePrivilegeAmounts.push(999);
			}

			for(const role of roles) {

				const privilege = await serverCache.getRole(role.id);
				if(privilege != null && typeof (privilege) == 'number') {
					rolePrivilegeAmounts.push(privilege);
				}
			}


			if(rolePrivilegeAmounts.length === 0) {
				userdata.privilege = 0;
			}
			else{
				userdata.privilege = Math.max(...rolePrivilegeAmounts);
			}
		}


		if(serverCache.projects.enabled()) {
			userdata.currentproject = await serverCache.projects.getProjectFromChannel(message.channel.id);
			if(userdata.currentproject != null) {
				if(userdata.currentproject.ownerid == message.author.id || userdata.isadmin === true) {
					userdata.ownsproject = true;
				}
			}
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

	await commandManager.memberJoinEvent({ member: member, cache: serverCache });
});


Initiate();
