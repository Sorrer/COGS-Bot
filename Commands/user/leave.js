
module.exports.settings = {
  name: "leave",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Removes you from a project",   //Helpful description of the command
  usage: "leave <projectid> - Leaves the project via its ID",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: false,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.execute = async function(author, params, message) {
    var server = module.exports.server;
    var mysqlCon = module.exports.mysqlCon;

    const [channelinfo, fields] = await mysqlCon.query("SELECT * FROM channelinfo WHERE projectid = ?", [params[0]]);

    if(!channelinfo || !channelinfo[0]) {
        module.exports.logger.sendDM(author, "Invalid project ID!", "Make sure you use project id that is listed!");
        return;
    }

    if((author.isOwner && params[0] == author.ownerProjectID)){
        module.exports.logger.sendDM(author, "You own the project", "Can't leave a project you own. Request it to be deleted! (If this is an error please contact e-board)");
        return;
    }

    const [checkAlreadyIn, fields2] = await mysqlCon.query("SELECT * FROM usergroup WHERE channelid = ? AND userid = ?", [channelinfo[0].channelid, author.id]);

    if((checkAlreadyIn && checkAlreadyIn[0])){

    }else{
        module.exports.logger.sendDM(author, "Not in project", "Can't leave a project you are not in! (If this is an error please contact e-board)");
        return;
    }



    //Remove usergroup for main project
    await mysqlCon.query("DELETE FROM usergroup where channelid = ? and userid = ?",  [channelinfo[0].channelid, author.id]);

    //Remove user to main channels
	let vchannel = server.channels.cache.get(channelinfo[0].voicechannelid);
	let tchannel = server.channels.cache.get(channelinfo[0].channelid);

    module.exports.tools.RemoveUserFromChannel(vchannel, author.id);
    module.exports.tools.RemoveUserFromChannel(tchannel, author.id);

    //Add user to extra channels

    const [projectChannels, pFields] = await mysqlCon.query("SELECT * FROM projectchannels WHERE projectid = ?", channelinfo[0].projectid);

    for(let pchannel of projectChannels){
        let grabbedChannel = server.channels.cache.get(pchannel.channelid);
        if(grabbedChannel) module.exports.tools.RemoveUserFromChannel(grabbedChannel, author.id);
    }

    module.exports.logger.log("Player left project '" + channelinfo[0].channeltitle + "'", "<@" + author.id + ">", "#eb3a34");

    let mainChannel = server.channels.cache.get(channelinfo[0].channelid);
    mainChannel.send("<@" + author.id + "> left the project!");
}
