
module.exports.settings = {
  name: "changedescription",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Change description of your project inside the project listing.",   //Helpful description of the command
  usage: "changedescription <description> - Changes your project listing description",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: false,               //Only used by admins
  isOwner: true,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.execute = async function(author, params, message) {
    var mysqlCon = module.exports.mysqlCon;

    //Remove the command from message content to be left with a string
    var descriptionString = message.content.replace(";changedescription ", "");

    //Change channeltitle in database
    await mysqlCon.query("UPDATE channelinfo SET channelinfo = ? WHERE projectid = ?", [descriptionString, author.ownerProjectID]);

    //Update project listing
    await module.exports.projectlist.UpdateListing(author.ownerProjectID);
}
