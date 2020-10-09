const Discord = require('discord.js');

module.exports.settings = {
  name: "deleteproject",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Deletes a project via any form of id, channel mention, channel id, projet id.",   //Helpful description of the command
  usage: "deleteproject <projectID> - Deletes the project with that ID. Requires privilege to do so.",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: true,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.mysqlCon = "WillBeLoaded";
module.exports.client = "WillBeLoaded"; //Discord
module.exports.server = "WillBeLoaded"; //Discord
module.exports.logger = "WillBeLoaded";
module.exports.commands = "WillBeLoaded"; //Commands This
module.exports.projectlist = "WillBeLoaded";

module.exports.execute = async function(author, params, message) {
    var tools = module.exports.tools;
    var logger = module.exports.logger;
    var mysqlCon = module.exports.mysqlCon;
    var server = module.exports.server;

    var channelid = message.mentions.channels.first();

    if(!channelid){
        channelid = params[0];
    }

    if(!channelid){
        logger.sendInvalidCommandDM(author, message.content.toString(), "Usage: " + module.exports.settings.usage);
        return;
    }

    var [rows, field] = await mysqlCon.query("SELECT * FROM channelinfo WHERE channelid = ? or projectid = ?", [channelid, channelid]);

    if(!rows || rows.length == 0){
        logger.sendInvalidCommandDM(author, message.content.toString(), "Could not find project");
        return;
    }


	let vchannel = server.channels.cache.get(rows[0].voicechannelid);
	let channel = server.channels.cache.get(rows[0].channelid);

    module.exports.projectlist.DeleteListing(rows[0].projectmessageid);


	if(vchannel) vchannel.delete("Deleted by " + message.author.id);
	if(channel) channel.delete("Deleted by " + message.author.id);

    const [channelRows, field2] = await mysqlCon.query("SELECT * FROM projectchannels WHERE projectid = ?", [rows[0].projectid]);


    for(let eChannel of channelRows){
       let deleteChannel = server.channels.cache.get(eChannel.channelid);
       if(deleteChannel) deleteChannel.delete("Deleted by " + message.author.id);
    }

	mysqlCon.query("DELETE from channelinfo WHERE channelid = ?", rows[0].channelid);
	mysqlCon.query("DELETE from usergroup WHERE channelid = ?", rows[0].channelid);
    mysqlCon.query("DELETE from projectchannels WHERE projectid = ?", rows[0].projectid);

    logger.log("Deleted project " + rows[0].channeltitle, "Deleted by <@" + message.author.id + ">.\n" + channelRows.length + " extra channels deleted.", "#f5425d");
}
