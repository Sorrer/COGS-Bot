
//Settings to define this command
module.exports.settings = {
  name: "test",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Does a test",   //Helpful description of the command
  usage: "test someParam someParam - Replace some param with what ever doesn't matter",   //Helpful usage description of the command
  requiredParams: 2,            //Only define if you need x amount of parameters
  allowDM: true,                //Only define if this command supports DM usage,
  isAdmin: false,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: true                  //Is a task that has multiple message inputs
}


//References that will be loaded on command initiation
module.exports.mysqlCon = "WillBeLoaded";
module.exports.client = "WillBeLoaded"; //Discord
module.exports.server = "WillBeLoaded"; //Discord
module.exports.logger = "WillBeLoaded";
module.exports.commands = "WillBeLoaded"; //Commands This
module.exports.tools = "WillBeLoaded"; //Commands This
module.exports.projectlist = "WillBeLoaded"; //Helping tools for project listing


//Main function that will be ran if the settings match up with what the input has
module.exports.execute = function(author, params, message) {
  console.log("Executing: " + params);
  return module.exports.task1;
}

//Task functions that'll be used for multi message commands
//IMPORTANT - Inorder to continue the command task chain, return the next function
//Also data parameter is persistant across all commands
module.exports.task1 = function(message, data){
  console.log("Task1");
  data.test = "yes";
  return module.exports.task2;
}

module.exports.task2 = function(message, data){
  console.log("Task2 : " + data.test);
}
