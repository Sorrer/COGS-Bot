
module.exports.settings = {
  name: "join",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Joins you to a project!",   //Helpful description of the command
  usage: "join <projectid> - Joins the project via its ID",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: false,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.execute = async function(author, params, message) {
    var server = module.exports.server;
    var mysqlCon = module.exports.mysqlCon;
    var tools = module.exports.tools;
    var logger = module.exports.logger;

    const [channelinfo, fields] = await mysqlCon.query("SELECT * FROM channelinfo WHERE projectid = ?", [params[0]]);

    if(!channelinfo || !channelinfo[0]) {
        logger.sendDM(author, "Invalid project ID!", "Make sure you use project id that is listed!");
        return;
    }

    const [checkAlreadyIn, fields2] = await mysqlCon.query("SELECT * FROM usergroup WHERE channelid = ? AND userid = ?", [channelinfo[0].channelid, author.id]);

    if((checkAlreadyIn && checkAlreadyIn[0] && checkAlreadyIn.length > 0) || (author.isOwner && params[0] == author.ownerProjectID)){
        logger.sendDM(author, "Already in project", "Can't join a project you are already in! (If this is an error please contact e-board)");
        return;
    }

    //Add usergroup for main project
    await mysqlCon.query("INSERT INTO usergroup (userid, channelid) VALUES (?,?)",  [author.id, channelinfo[0].channelid]);

    //Add user to main channels
	let vchannel = server.channels.cache.get(channelinfo[0].voicechannelid);
	let tchannel = server.channels.cache.get(channelinfo[0].channelid);

    tools.AddUserToChannel(vchannel, author.id);
    tools.AddUserToChannel(tchannel, author.id);

    //Add user to extra channels

    const [projectChannels, pFields] = await mysqlCon.query("SELECT * FROM projectchannels WHERE projectid = ?", channelinfo[0].projectid);

    for(let pchannel of projectChannels){
        let grabbedChannel = server.channels.cache.get(pchannel.channelid);
        if(grabbedChannel) tools.AddUserToChannel(grabbedChannel, author.id);
    }

    logger.log("Player joined project '" + channelinfo[0].channeltitle + "'", "<@" + author.id + ">", "#40f029");

    let mainChannel = server.channels.cache.get(channelinfo[0].channelid);
    mainChannel.send("<@" + author.id + "> joined the project!");
}


module.exports.OnMemberJoin = function(member){

    const [joinedProjects, fields2] = await mysqlCon.query("SELECT * FROM usergroup WHERE userid = ?", [member.id]);

    if(joinedProjects){

        for(var usergroup in joinedProjects){

            console.log("User has this group joined: " + usergroup);
            
        }
    }


    var tools = module.exports.tools;
    var logger = module.exports.logger;

}
