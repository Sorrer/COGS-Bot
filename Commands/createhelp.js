const Discord = require('discord.js');

//Settings to define this command
module.exports.settings = {
  name: "createhelp",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Used to create help card",   //Helpful description of the command
  usage: "createhelp <mentionChannel> - Creates help card in that channel",   //Helpful usage description of the command
  requiredParams: 1,            //Only define if you need x amount of parameters
  allowDM: true,
  isAdmin: true,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}


//References that will be loaded on command initiation
module.exports.mysqlCon = "WillBeLoaded";
module.exports.client = "WillBeLoaded"; //Discord
module.exports.server = "WillBeLoaded"; //Discord
module.exports.logger = "WillBeLoaded";
module.exports.commands = "WillBeLoaded"; //Commands This


//Main function that will be ran if the settings match up with what the input has
module.exports.execute = function(author, params, message) {
    console.log("Creating help");

    var server = module.exports.server;
    var logger = module.exports.logger;
    if(!server){
        console.log("ERROR: Could not getting current server");
        return;
    }


    var commands = "If you want to create a project DM the e-board! Or send your request in <#755540294413582365>\n\n"
	+ "**General Commands**\n\n";

    module.exports.commands.CommandsRegistry.forEach(e => {
        if(!e.settings.isOwner && (!e.settings.isAdmin)) commands += ';' + e.settings.usage + "\n";
    });

    commands += "\n\n**Owner Commands**\n\n";

    module.exports.commands.CommandsRegistry.forEach(e => {
        if(e.settings.isOwner && (!e.settings.isAdmin))  commands += ';' + e.settings.usage + "\n";
    });


    const embed = new Discord.MessageEmbed()
	.setColor("#c829f0")
	.setTitle("Help")
	.setDescription(commands);


    var channel = server.channels.cache.get(params[0]);

    if(channel){
        channel.send(embed);
    }else{
        logger.sendInvalidCommandDM(author, "creathelp " + params[0], "Couldn't find channel id");
    }

}
