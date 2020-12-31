const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const mysql = require('mysql2')

const logger = require('./logger.js');
const discordtools = require('./discord-tools.js');

const Commands = require('./Commands.js')
const projectlist = require('./projectlist.js');

var mysqlCon;
var currentServer = "";

async function startup(){
	console.log("Startup");

	/*
	mysqlCon.query("DELETE FROM channelinfo" , function (err, result) {
		if (err) throw err;
		console.log("Number of records deleted: " + result.affectedRows);
	});*/

	await client.guilds.fetch(config.discord.serverid).then((server) => {
        console.log("Got server");
        logger.server = server;
        logger.client = client;
        logger.channelID = config.discord.channel.log;

        discordtools.server = server;

        currentServer = server;


	});

    projectlist.mysqlCon = mysqlCon;
    projectlist.client = client;
    projectlist.tools = discordtools;

    console.log("Registering Commands");

    Commands.InitiateCommands(client, mysqlCon, currentServer, logger, discordtools, projectlist);
}

client.once('ready', () => {
    console.log('Client connected!');
    startup();
});



async function startCon(){
    console.log("Connecting to DB");
    mysqlCon = await mysql.createPool(config.mysql).promise();
    console.log("Connecting to Discord Bot");
    client.login(config.bot.token);
}
startCon();

client.on("message", async function(message){

    //Prevent loops, this bot isn't allow to execute itself
    if(message.author.id === client.user.id) return;

    //Execute commands only if its in the correct format, or if the person has a task pending for them.
    if(message.content.startsWith(";") || Commands.InTaskQueue(message.author.id)){

        var isAdmin = config.discord.admins.includes(message.author.id);

        var isOwner = false;
        var ownerProjectID = -1;


        //Check for ownership, if admin wants to do something for a channel that requires a project id, we'll try to get the project id if available.

	if(isAdmin){
            const [ownerInfo, fields] = await mysqlCon.query("SELECT * FROM channelinfo WHERE channelid = ?", [message.channel.id]);

            if(ownerInfo && ownerInfo[0]){
                ownerProjectID = ownerInfo[0].projectid;
                isOwner = true;
            }
        }else{
            try{

                const [ownerInfo, fields] = await mysqlCon.query("SELECT * FROM channelinfo WHERE owner = ?", [message.author.id]);

                if(ownerInfo && ownerInfo[0]){
                    //If they own multiple projects we'll only use the project id of their current channel
                    if(ownerInfo.length > 1){

                        for(let info of ownerInfo){
                            if(ownerInfo.channelid == message.channel.id){
                                ownerProjectID = info.projectid;
                                isOwner = true;
                                break;
                            }
                        }

                    }else{

                        ownerProjectID = ownerInfo[0].projectid;
                        isOwner = true;

                    }
                }

            }catch(e){
                console.log(e);
                console.log("Error finding ownership");
            }
        }

        if(ownerProjectID == -1){
            isOwner = false;
        }

	//Data gathered, execute command
        try{
            await Commands.ExecuteMessage(message, message.author, isAdmin, isOwner, ownerProjectID);
        }catch(e){
            console.log(e);
            console.log("Error executing message");
        }

        if(message.channel.type != "dm") message.delete();
    }

});

client.on("guildMemberAdd", async function(member){
    //Member joined, check if member was part of any projects, if they owned any, and then add them back to their respective position (aka rebuild user)

	logger.log("Member Joined: <@" + member.id +">", "Checking for past life.", "#feef6d");
	await Commands.OnMemberJoin(member);
	logger.log("Member Joined: <@" + member.id +">", "Connected to past life if existed.", "#feef6d");

});
