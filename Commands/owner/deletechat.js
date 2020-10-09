
module.exports.settings = {
  name: "deletechat",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Deletes a chat that your project owns",   //Helpful description of the command
  usage: "deletechat <#mentionchannel> - Deletes the text channel that has been created. Make sure you #mention it!",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: false,               //Only used by admins
  isOwner: true,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.execute = async function(author, params, message) {
    var server = module.exports.server;
    var mysqlCon = module.exports.mysqlCon;
    var logger = module.exports.logger;

    //Find channel from projectchannels

    var channelid = message.mentions.channels.first();

    if(!channelid) {
        logger.sendInvalidCommandDM(author, message.content.toString(), "Could not find mention, please mention a channel using #!");
        return;
    }
    console.log("Deleting " + channelid.id);
    const [projectChannelRow, fields] = await mysqlCon.query("SELECT * FROM projectchannels WHERE channelid = ?", [channelid.id]);

    //Make sure the project actually owns the channel
    var firstFound = projectChannelRow[0];
    if(firstFound == null){
        logger.sendInvalidCommandDM(author, message.content.toString(), "Make sure to only mention your channel!");
        return;
    }

    //Delete channel
    var channel = server.channels.cache.get(channelid.id);

    if(!channel){
        console.log("Error: tried to get channel to delete, doesn't exist anymore");
        logger.sendInvalidCommandDM(author, message.content.toString(), "Couldnt find channel!");
        return;
    }

    channel.delete();


    await mysqlCon.query("DELETE FROM projectchannels WHERE channelid = ?", [channelid.id]);
    const [foundChannels, xFields] = await mysqlCon.query("SELECT * FROM projectchannels WHERE projectid = ?", [author.ownerProjectID]);

    //If this is the last channel from projectchannels with this id (if no more channels can be found). Delete the category
    if(!foundChannels || foundChannels.length == 0){
        const [categoryRows, crFields] = await mysqlCon.query("SELECT categoryid FROM channelinfo WHERE projectid = ?", [author.ownerProjectID]);

        if(categoryRows[0] && categoryRows[0].categoryid){

            let category = server.channels.cache.get(categoryRows[0].categoryid);
            await category.delete();

            await mysqlCon.query("UPDATE channelinfo SET categoryid = null WHERE projectid = ?",[author.ownerProjectID]);
        }
    }

    module.exports.logger.log("Deleted chat '" + channelid.name + "'", "From project id '" + author.ownerProjectID + "'");
}
