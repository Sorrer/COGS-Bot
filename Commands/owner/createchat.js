
module.exports.settings = {
  name: "createchat",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Creates a chat that only your project group can see!",   //Helpful description of the command
  usage: "createchat <name> - Creates a text chat that you can use!",   //Helpful usage description of the command
  allowDM: false,
  isAdmin: false,               //Only used by admins
  isOwner: true,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}

module.exports.execute = async function(author, params, message) {
    var server = module.exports.server;
    var mysqlCon = module.exports.mysqlCon;
    var tools = module.exports.tools;

    //Check if catagory has been made for this group yet. if not create one and update the info with the channelID
    const [categoryRows, cFields] = await mysqlCon.query("SELECT categoryid, channeltitle, channelid, owner FROM channelinfo WHERE projectid = ?", [author.ownerProjectID]);

    if(!categoryRows) return;

    var category = categoryRows[0];
    var findCategory = await server.channels.cache.get(category.categoryid);

    if(category.categoryid == null || !findCategory){
        //Create category
        let projectcategory = server.channels.cache.find(c => c.name == "projects" && c.type == "category");

        console.log(projectcategory.position);

        var newCategory = await server.channels.create(category.channeltitle.toString(), {
            type: 'category',
            permissionOverwrites: [{
                id: server.roles.everyone,
                deny: ['VIEW_CHANNEL'],
                allow: ['MENTION_EVERYONE']
            },{
                id: module.exports.client.user.id,
                allow: ['VIEW_CHANNEL']
            }
            ],
            position: (projectcategory.position + 1)
        });

        newCategory.setPosition((projectcategory.position + 1));

        category.categoryid = newCategory.id;
        //Update database
        await mysqlCon.query("UPDATE channelinfo SET categoryid = ? WHERE projectid = ?", [newCategory.id, author.ownerProjectID]);

    }

    var chatTitle = message.content.toString().replace(";createchat ", "");

    //Create channel with the supplied name
    var newChannel = await server.channels.create(chatTitle, {
        type: "test",
        parent: category.categoryid
    })


    //Add all project users to that channel perms ONLY

    const[users, uFields] = await mysqlCon.query("SELECT userid FROM usergroup WHERE channelid = ?", category.channelid);
    tools.AddUserToChannel(newChannel, author.id, true);
    tools.AddUserToChannel(newChannel, category.owner, true);
    for(let user of users){
        tools.AddUserToChannel(newChannel, user.userid);
    }

    //Add channel to mysql database
    await mysqlCon.query("INSERT INTO projectchannels (projectid, channelid, isvoice) VALUES (?,?,?)", [author.ownerProjectID,newChannel.id,0])
}
