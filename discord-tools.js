const Discord = require('discord.js');

module.exports.server = null;

module.exports.CreateChannel = function CreateChannel(channelName, categoryName, channelType = "text", needsCategory = true){
    var server = module.exports.server;
    if(!server) return;
    let category = server.channels.cache.find(c => c.name == categoryName && c.type == "category");


	if(needsCategory){
		if (!category){
			throw new Error("Category " + channelName + " does not exist");
			return;
		}
	}


	var newChannel = server.channels.create(channelName,{
		type: channelType,
		parent: category.id
	});


	console.log("Created new channel " + channelName);
	return newChannel;
}


module.exports.AddUserToChannel = function AddUserToChannel(channel, userID, isOwner = false){

	console.log("Adding " + userID + " to channel " + channel.id);


	try{

		if(isOwner){
			channel.updateOverwrite(userID, {
				VIEW_CHANNEL: true,
				MANAGE_MESSAGES: true
			});
		}else{
			channel.updateOverwrite(userID, {
				VIEW_CHANNEL: true
			});
		}

	}catch{
		console.error();
	}
}

module.exports.RemoveUserFromChannel = function RemoveUserFromChannel(channel, userID){
	let perms = channel.permissionOverwrites.get(userID);
	if(perms){
		perms.delete();
	}else{
		console.log("Error: Tried to remove invalid user from channel");
	}
}

module.exports.GenerateProjectEmbed = function GenerateProjectEmbed(channelinfo, channeldetails, CurrentMembers = 0){
	if(!channelinfo) {
		console.log("Tried to rebuild a null channelinfo");
		return null;
	}

	const embed = new Discord.MessageEmbed()

    embed.setColor('#ffffff')
    .setTitle(channelinfo.channeltitle.toString("utf8"))
    .setDescription(channelinfo.channelinfo.toString("utf8"));

	if(channeldetails){
		if(channeldetails.gameengine){
            embed.addFields({name: "Enggine", value: channeldetails.gameengine, inline: true});
		}
		if(channeldetails.genre){
            embed.addFields({name: "Genre", value: channeldetails.genre , inline: true});
		}
	}

	embed.addFields(
		{name: "Owner", value: "<@" + channelinfo.owner.toString("utf8") + ">", inline: true},
		{name : "Members", value: CurrentMembers, inline: true},
		{name: "ID", value: channelinfo.projectid, inline: true}
	);

	return embed;
}
