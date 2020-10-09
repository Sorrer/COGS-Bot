module.exports.settings = {
  name: "updateprojectlisting",                 //Name of the command (IMPORTANT LOWERCASE ONLY)
  description: "Updates project listing with edited project listing that has new info",   //Helpful description of the command
  usage: "updateprojectlisting <projectID> - Refreshes project listing with current info. (Use 'all' instead to update every listing)",   //Helpful usage description of the command
  requiredParams: 1,
  allowDM: false,
  isAdmin: true,               //Only used by admins
  isOwner: false,               //Only used by owners of discord chnnales
  isTask: false                  //Is a task that has multiple message inputs
}


module.exports.execute = async function(author, params, message) {

    var mysqlCon = module.exports.mysqlCon;

    if(params[0] == "all"){
        const [channelinfoRows, field] = mysqlCon.query("SELECT * FROM channelinfo");

        for(let channelinfo of channelinfoRows) {
            module.exports.projectlist.UpdateListing(channelinfo.projectid);
        }
    }else{
        module.exports.projectlist.UpdateListing(params[0]);
    }

}
