

var CommandsLoadRegistry =
[
    "help", "createhelp",
    "admin/createproject", "admin/deleteproject", "admin/updateprojectlisting", "admin/serverinfo",
    "user/join", "user/leave",
    "owner/changedescription", "owner/changetitle", "owner/createchat", "owner/deletechat"
]

var CommandsRegistry = [];
var Logger = {
    log: function(e) {console.log(e)},
    sendDM: function(reciever, title, message, color = "dd"){console.log(reciever + " DM - " + title + "message")},
    sendInvalidCommandDM: function(reciever, theirMessage, msg, color = "dd") {console.log(reciever + " InvalidCommandDM - \n  " + theirMessage + "\n  " + msg)}
};

var OnMemberJoinCalls = [];


function VerifyCommand(command){

    if(!command){
        console.log("Error: Command file is empty");
        return false;
    }

    //Check if command settings are correct
    if(command.settings){
        if(!command.settings.name){
            console.log("Error: Command invalid. No name found");
            return false;
        }
        if(command.settings.name == ""){
            console.log("Error: Command invalid. Name is empty");
            return false;
        }
    }else{
        console.log("Error: Command invalid. No settings found");
        return false;
    }

    if(command.execute && typeof command.execute == 'function'){

    }else{
        console.log("Error: Command invalid. Execute function not found");
        return false;
    }



    return true;
}

function LoadCommand(command, discordClient, mysqlCon, discordServer, discordtools, projectlist){


    command.mysqlCon = mysqlCon;
    command.client =  discordClient;
    command.server = discordServer;
    command.logger = Logger;
    command.tools = discordtools;
    command.projectlist = projectlist;
    command.commands = {
        CommandsRegistry: CommandsRegistry
    };


    if(command.OnMemberJoin){
        OnMemberJoinCalls.push(command.OnMemberJoin);
        console.log("Member join detected for '" + command.settings.name + "'. Registered");
    }

    CommandsRegistry.push(command);

    console.log("Loaded command: '" + command.settings.name + "' - " + command.settings.description + '\n');
}

module.exports.InitiateCommands = function InitiateCommands(discordClient, mysqlCon, discordServer, logger, discordtools, projectlist){
    if(logger) Logger = logger;
    CommandsLoadRegistry.forEach( e => {

        console.log("Verifying command: " + e);

        try{
            var com = require("./Commands/" + e + ".js");

            if(VerifyCommand(com)){
                console.log("Loading command: " + e);
                LoadCommand(com, discordClient, mysqlCon, discordServer, discordtools, projectlist);
            }
        }catch(e){
            console.log(e);
            console.log("Error: Command Invalid. Couldn't find file or file error");
        }
    });
}


var TaskQueue = [];

function AddTask(clientID, function_, allowDM, data = {}){
    console.log("Adding task for: " + clientID);
    TaskQueue.push({id: clientID, func: function_, allowDM: allowDM, data: data});
}

module.exports.MemberJoinEvent = async function ExecuteMemberJoinEvent(member){

    let succesfullyExecuted = 0;

    for(var i = 0; i < OnMemberJoinCalls.length; i++){
        try{
            
            if(await callback[i](member)){
                succesfullyExecuted++;
            }

        }catch(e){
            try{
                Logger.logError("Failed to execute callback", "Callback: " + callback + "\n" + e);
            }catch(e){
                console.log("Failed to send error for callback", "Callback: " + callback + "\n" + e);
            }
        }
    }

    return succesfullyExecuted;

}

module.exports.InTaskQueue = function InTaskQueue (clientID){
    for(let task of TaskQueue){
        if(task.id == clientID) return true;
    }

    return false;
}

module.exports.ExecuteMessage = async function ExecuteMessage(message, author = {}, isAdmin = false, isOwner = false, ownerProjectID = null){

    var isDM = message.channel.type == "dm";

    var foundTask = false;

    var index;
    for(index = 0; index <  TaskQueue.length; index++){
        let task = TaskQueue[index];
        if(task.id == author.id){

            var newTask = false;

            //Run task only if they person did not type n to cancel the command
            try{
                if(message.content.toLowerCase() != "n" || (isDM && !task.allowDM)) newTask = await task.func.apply(this, [message, task.data]);
            }catch(e){
                console.log(e);
                console.log("Failed to do task. Make sure you are accounting if its dm or not");
            }

            if(newTask && typeof newTask == 'function'){
                task.func = newTask;
            }else{
                TaskQueue.splice(index, 1);
            }

            foundTask = true;
            break;
        }
    }

    if(foundTask){
        return;
    }


    //Splits up message into bite sized strings so they can easily be used
    var command_parameters = message.content.toLowerCase().split(" ");;

    if(!command_parameters) return;

    var command_name = command_parameters[0];
    command_parameters.splice(0, 1);

    if(!command_name.startsWith(";")) return;
    command_name = command_name.replace(";", "");




    for(let element of CommandsRegistry){

        //console.log("Checking command " + element.settings.name + " | "+ command_name);
        //Check if command mataches up
        if(element.settings.name != command_name) {
            continue;
        }
        //console.log("Found command");
        //Check if parameters are required and match
        if(command_parameters && element.settings.requiredParams && element.settings.requiredParams != command_parameters.length) {
            Logger.sendInvalidCommandDM(author, message.content, "Not enough parameters!\nUsage: " + element.settings.usage);
            break;
        }

        //Check if perms to use commands
        if((element.settings.isAdmin && !isAdmin) || (element.settings.isOwner && !isOwner)){
            break;
        }

        if(isDM && !element.settings.allowDM){
            Logger.sendInvalidCommandDM(author, message.content, "This command does not allow DM's please use it in the server!");
            break;
        }

        //console.log("Launching command");
        //All is good, launch the command!

        try{
            author.isAdmin = isAdmin;
            author.isOwner = isOwner;
            author.ownerProjectID = ownerProjectID;

            if(element.settings.isTask){
                var task = await element.execute(author, command_parameters, message);
                //Make sure we get a task back, if so we will make sure it gets queued
                if(typeof task == 'function'){
                    AddTask(author.id, task, element.settings.allowDM);
                }
            }else{
                //console.log("Executing command");
                await element.execute(author, command_parameters, message);
            }
        }catch(e){
            console.log(e);
            console.log("Failed to execute command: " + element.settings.name);

            try{
                message.channel.send(">Internal Server Error");
            }catch(e){
                console.log("Failed to send internal server error message");
            }
        }


        break;

    }

}




//InitiateCommands("DiscordClient", "MySQLConnection");
//ExecuteMessage( {content : ";test yes no"}, {id: "Player"});
//ExecuteMessage( {content : "yeet"}, {id: "Player"});
//ExecuteMessage( {content : "yoot"}, {id: "Player"});

//InitiateCommands();
//InitiateCommands();
//ExecuteMessage({content: ";help"})
//ExecuteMessage({content: ";help"}, {id: "Person"})
//ExecuteMessage({content: ";createhelp"}, {id: "Person"}, true)
