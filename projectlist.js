module.exports.mysqlCon = null;
module.exports.tools = null;
module.exports.client = null;

module.exports.CreateListing = async function (channelinfo){

    var tools = module.exports.tools;
    var mysqlCon = module.exports.mysqlCon;
    var client = module.exports.client;

    var create_embed = tools.GenerateProjectEmbed(channelinfo, null, 1);
    const [joinlist, fields] = await mysqlCon.query("SELECT * FROM channeltag WHERE tag = 'joinlist'");

    if(joinlist[0]){
        let joinListChannel = client.channels.cache.get(joinlist[0].id);
        let sent = await joinListChannel.send(create_embed);
        mysqlCon.query("UPDATE channelinfo SET projectmessageid = ? where projectid = ?", [sent.id, channelinfo.projectid]);
    }
}

module.exports.UpdateListing = async function (projectid){

    var tools = module.exports.tools;
    var mysqlCon = module.exports.mysqlCon;
    var client = module.exports.client;

    const [channelinfoRows, ciField] = await mysqlCon.query("SELECT * FROM channelinfo WHERE projectid = ?", [projectid]);

    if(!channelinfoRows) return;

    var channelinfo = channelinfoRows[0];

    if(!channelinfo) return;

    const [usersRows, uField] = await mysqlCon.query("SELECT * FROM usergroup WHERE channelid = ?", [channelinfo.channelid]);

    var create_embed;

    if(!usersRows){
        create_embed = tools.GenerateProjectEmbed(channelinfo, null, 1);
    }else{
        create_embed = tools.GenerateProjectEmbed(channelinfo, null, usersRows.length + 1);
    }



    const [joinlist, fields] = await mysqlCon.query("SELECT * FROM channeltag WHERE tag = 'joinlist'");

    if(joinlist[0]){
        let joinListChannel = client.channels.cache.get(joinlist[0].id);
        try{
            const message = await joinListChannel.messages.fetch(channelinfo.projectmessageid);
            if(message) message.edit(create_embed);
        }catch(e){
            console.log(e);
            console.log("Could not find project message, didn't delete");
        }
    }

}

module.exports.DeleteListing = async function (messageid){
    var tools = module.exports.tools;
    var mysqlCon = module.exports.mysqlCon;
    var client = module.exports.client;

    const [joinlist, fields] = await mysqlCon.query("SELECT * FROM channeltag WHERE tag = 'joinlist'");

    if(joinlist[0]){
        let joinListChannel = client.channels.cache.get(joinlist[0].id);
        try{
            const message = await joinListChannel.messages.fetch(messageid)
            if(message) message.delete();
        }catch(e){
            console.log("Could not find project message, didn't delete");
        }
    }
}
