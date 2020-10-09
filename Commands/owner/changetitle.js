
module.exports.settings = {
  name: "changetitle",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Change title of your project inside the project listing.",   //Helpful description of the command
  usage: "changetitle <title> - Changes your project listing title",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: false,               //Only used by admins
  isOwner: true,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.execute = async function(author, params, message) {
    var mysqlCon = module.exports.mysqlCon;
    var server = module.exports.server;

    //Remove the command from message content to be left with a string
    var titleString = message.content.replace(";changetitle ", "");

    //Change channeltitle in database
    await mysqlCon.query("UPDATE channelinfo SET channeltitle = ? WHERE projectid = ?", [titleString, author.ownerProjectID]);

    //Update project listing
    await module.exports.projectlist.UpdateListing(author.ownerProjectID);

    //Change main channel's name
    const [channelinfoRows, cFields] = await mysqlCon.query("SELECT * FROM channelinfo WHERE projectid = ?", [author.ownerProjectID]);
    console.log(author.ownerProjectID);
    let tChannel = server.channels.cache.get(channelinfoRows[0].channelid);
    let vChannel = server.channels.cache.get(channelinfoRows[0].voicechannelid);
    const oldName = tChannel.name;

    //Change category

    if(channelinfoRows[0].categoryid != null){
        let category = server.channels.cache.get(channelinfoRows[0].categoryid);
        if(category) category.setName(titleString);
    }

    tChannel.setName(titleString);
    vChannel.setName(titleString + " Voice");

    module.exports.logger.log("Changed project name '" + titleString + "'", "Changed from '"+oldName+"' to '" + titleString + "'");
}
