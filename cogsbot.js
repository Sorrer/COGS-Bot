const CommandManager = require('./CogsLib/Commands.js');
const Logger = require('./CogsLib/Logger.js');
const Discord = require('discord.js');
const MysqlHandler = require('./CogsLib/MysqlHandler.js');
const ms = require('ms')
const fs = require('fs')
const ascii = require("ascii-table");
const ServerCacheManager = require('./CogsLib/ServerCache/ServerCacheManager.js');

const config = require('./config.json');

const logger = new Logger({ server: { id: 'test' } });
// const bot = new Discord.Client();

const commandManager = new CommandManager('./Commands', logger);


// Mysql Handler
const mysqlHandler = new MysqlHandler(config.mysql, logger);

client.slashCommands = new Discord.Collection();
// Discord ClientID
const client = new Discord.Client({
	partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER", "REACTION"],
    intents:[Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_BANS, Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_WEBHOOKS, Discord.Intents.FLAGS.GUILD_INVITES, Discord.Intents.FLAGS.GUILD_VOICE_STATES, Discord.Intents.FLAGS.GUILD_PRESENCES, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
    },  
    restTimeOffset: 0
  }
);

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

	let slash = [];
	let table = new ascii("Slash commands");

	fs.readdirSync("./slashcmd/").forEach((dir) => {

		
		const commands = fs
		  .readdirSync(`./slashcmd/${dir}/`)
		  .filter((file) => file.endsWith(".js"));
  
		
		for (let file of commands) {
		  let pull = require(`./slashcmd/${dir}/${file}`);
  

		  if (pull.name) {
  
	
			client.slashCommands.set(pull.name, pull);
			slash.push(pull); 
			table.addRow(file, "✅"); 
		  } else {
			table.addRow(file, `❌  -> missing command parameters`); 
			continue;
		  }
		}
	  });
	  console.log(table.toString());
	  await client.application.commands.set(slash); 
	  
  
	
	const arrayOfStatus = ["Stuck in Unity","Why is my game not running", "Generating assets","Finding secrets","Coding Actually Good FPS", "Browsing stackoverflow","Trying to use Unreal","Developing the next Hottest game","Turning off and on", "No bugs, only features"]

        client.user.setActivity(arrayOfStatus[0]);
	let index = 0;
    setInterval(() => {
        if (index == arrayOfStatus.length) index = 0;
        const status = arrayOfStatus[index];
        client.user.setActivity(status);
        index++;
    }, ms("15 Minutes"));






	logger.local('Bot connected');
});

client.on('interactionCreate', async(interaction) => {

	  if (interaction.isCommand()) {
		await interaction.deferReply({ ephemeral: false }).catch(() => {});
	
	

		const cmd = client.slashCommands.get(interaction.commandName);

		if (!cmd)
		  return interaction.followUp({
			content: "Error Interacting With Slash Commands",
		  });

		if (cmd.permission) {
	
		  const authorPerms = interaction.channel.permissionsFor(
			interaction.member
		  );
	
		 
		  if (!authorPerms || !authorPerms.has(cmd.permission))
			return interaction.followUp({
			  content: "You do not have perms to run this command",
			});
		}
	
		
		cmd.run(client, interaction);
	  }
})
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
