const Discord = require('discord.js');

module.exports.server = null;
module.exports.client = null;
module.exports.channelID = null;

module.exports.log = function (title, msg, color = "#c829f0"){
    var server = module.exports.server;
    var channelID = module.exports.channelID;

    if(!server || !channelID) return;

	let logChannel = server.channels.cache.get(channelID);

	const embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(title)
	.setTimestamp()
    .setDescription(msg);

	logChannel.send(embed);

}

module.exports.logError = function (title, msg){
    module.exports.log("Error: " + title, msg, "#ED5565");
}

module.exports.sendDM = function (reciever, title, msg, color = "#c829f0"){
    var client = module.exports.client;

    if(!client) return;

	const embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(title)
	.setTimestamp()
    .setDescription(msg);

	client.users.cache.get(reciever.id).send(embed);

}

module.exports.sendInvalidCommandDM = function (reciever, theirMessage, msg, color = "#f5425d"){
    var client = module.exports.client;

    if(!client) return;

	const embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle("Error: Invalid Command")
	.setTimestamp()
    .setDescription(
        "*'" + theirMessage + "'*\n"+
        msg
    );

	client.users.cache.get(reciever.id).send(embed);

}
