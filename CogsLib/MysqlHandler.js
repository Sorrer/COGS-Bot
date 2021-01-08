// Class pass MYSQL distribution.
// Used to provide mysql connection access to different commands as needed.
// Can create quick query functions for popular calls. For example, getting a project from a specific server.


const mysql = require('mysql2');


class MysqlHandler {

	constructor(userInfo, logger) {
		this.userInfo = userInfo;
		this.logger = logger;

		if(!logger) {
			this.logger.local = console.log;
		}
	}


	async init() {
		this.connection = await mysql.createPool(this.userInfo).promise();
	}


	async query(query, values, within = false) {
		if(within !== true) {
			this.logger.localDebug('Executed non static query. Please use a default method.\n' + query);
		}

		const [results, fields] = await this.connection.query(query, values);

		if(!results) {
			return { results: [], fields: [] };
		}
		return { results: results, fields: fields };
	}

}


module.exports = MysqlHandler;
