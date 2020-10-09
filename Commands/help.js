const Discord = require('discord.js');

//Settings to define this command
module.exports.settings = {
  name: "help",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Prints each command with their description",   //Helpful description of the command
  usage: "help - Prints all the commands you can use with the bot!",   //Helpful usage description of the command
  allowDM: true,
  isAdmin: false,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}


//References that will be loaded on command initiation
module.exports.mysqlCon = "WillBeLoaded";
module.exports.client = "WillBeLoaded"; //Discord
module.exports.server = "WillBeLoaded"; //Discord
module.exports.logger = "WillBeLoaded";
module.exports.commands = "WillBeLoaded";


//Main function that will be ran if the settings match up with what the input has
module.exports.execute = function(author, params, message) {
    var client = module.exports.client;
    if(!client){
        console.log("ERROR: Could not get current client");
        return;
    }

    if(params && params[0]){
        var found = module.exports.commands.CommandsRegistry.some(e => {

            if(e.settings.isAdmin && !author.isAdmin) return false;
            if(e.settings.name == params[0]){
                const embed = new Discord.MessageEmbed()
            	.setColor("#c829f0")
            	.setTitle("Help ''" + e.settings.name + "''")
            	.setDescription('Usage - *;' + e.settings.usage + '*\n\n' + e.settings.description);

                client.users.cache.get(author.id).send(embed);

                return true;
            }
        });

        if(!found){
            client.users.cache.get(author.id).send("Couldn't find the command you were looking for.");
        }

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

    if(author.isAdmin){
        commands += "\n\n**Admin Commands**\n\n";
        module.exports.commands.CommandsRegistry.forEach(e => {
            if(e.settings.isAdmin)  commands += ';' + e.settings.usage + "\n";
        });
    }

    const embed = new Discord.MessageEmbed()
	.setColor("#c829f0")
	.setTitle("Help")
	.setDescription(commands);

    client.users.cache.get(author.id).send(embed);
}
