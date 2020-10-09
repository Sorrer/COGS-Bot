const Discord = require('discord.js');

module.exports.settings = {
  name: "createproject",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Creation task to create a new project",   //Helpful description of the command
  usage: "createproject - Starts the creation process. Requires project name, description, and project owner",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: true,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: true                  //Is a task that has multiple message inputs
}

module.exports.mysqlCon = "WillBeLoaded";
module.exports.client = "WillBeLoaded"; //Discord
module.exports.server = "WillBeLoaded"; //Discord
module.exports.logger = "WillBeLoaded";
module.exports.commands = "WillBeLoaded"; //Commands This
module.exports.tools = "WillBeLoaded"; //Helping tools

module.exports.execute = function(author, params, message) {
    message.channel.send("Starting creation process! What is the project name? (Cancel any task by saying n)");
    return module.exports.task1;
}

//Project name
module.exports.task1 = function CreateProjectStage1(message, data){

	data.projectname = message.content.toString();
	message.channel.send("Name is **" + data.projectname.toString() + "**. What is the info? (Cancel any task by saying n)");
    return module.exports.task2;
}

//Project Info
module.exports.task2 = function CreateProjectStage2(message, data){

	data.projectinfo = message.content.toString();
	message.channel.send("Info is " + data.projectinfo.toString() + "\nWhat is the owner (Ping the owner please)? (Cancel any task by saying n)");
    return module.exports.task3;
}
//Project Owner ID
module.exports.task3 = function CreateProjectStage3(message, data){
	var pingedName = message.mentions.users.first();
	if(!pingedName) return;
	data.ownerid = pingedName.id.toString();

	message.channel.send("Creation info gathered! Finalizing project! \nName is " + data.projectname.toString() + "\nInfo is " + data.projectinfo.toString() + "\nOwner is <@" + data.ownerid +">");
	message.channel.send("Does this info sound good? (y/n)");

    return module.exports.task4;

}

module.exports.task4 = async function CreateProjectFinalize(message, data){


	if(message.content.toLowerCase() != "y"){
		message.channel.send("Canceling project creation");
		return;
	}

    var tools = module.exports.tools;
    var client = module.exports.client;
    var mysqlCon = module.exports.mysqlCon;

    var projectTextChannel = await tools.CreateChannel(data.projectname.toString(), "projects");
    var projectVoiceChannel = await tools.CreateChannel(data.projectname.toString() + " Voice", "projects", "voice");

    var sql = "INSERT INTO channelinfo (channelid, channelinfo, channeltitle, owner, voicechannelid, projectmessageid) VALUES (?,?,?,?,?,?)";
    var values = [projectTextChannel.id, data.projectinfo, data.projectname, data.ownerid, projectVoiceChannel.id, "0"];

    var insertProjectCreation = await mysqlCon.query(sql, values);
    const [selectChannelInfo, fields] = await mysqlCon.query("SELECT * FROM channelinfo WHERE channelid = ?", projectTextChannel.id);

	var firstRow = selectChannelInfo[0];
	if(firstRow){
        module.exports.projectlist.CreateListing(firstRow);
    }

	tools.AddUserToChannel(projectTextChannel, data.ownerid, true);
	tools.AddUserToChannel(projectVoiceChannel, data.ownerid);
    module.exports.logger.log("Project created "+ data.projectname, "<@" + message.author.id + "> owns the project <#" + projectTextChannel.id + ">");
}
