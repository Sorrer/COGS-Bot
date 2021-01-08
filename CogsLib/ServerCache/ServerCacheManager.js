const ServerCache = require('./ServerCache.js');
const Logger = require('../Logger.js');

class ServerCacheManager {
	constructor(mysqlCon, logger, bot) {
		this.mysqlCon = mysqlCon;
		this.bot = bot;
		this.caches = {};
		this.logger = logger;
	}

	async loadAll() {


		const servers = await this.mysqlCon.query('SELECT * FROM cogs.servers');


		for(const server of servers.results) {
			console.log(server);
			this.createCache(server);
		}

		this.logger.local('ServerCacheManager initiated. Loaded servers: ' + servers.results.length);
	}

	async createCache(serverQueryResults) {
		const logger = new Logger({
			bot: this.bot,
			prefix: '[' + serverQueryResults.guild + ']',
			server: { id: serverQueryResults.guild }
		});
		const serverCache = new ServerCache(this.mysqlCon, logger, serverQueryResults.guild);

		this.caches[serverQueryResults.guild] = serverCache;
	}

	async get(serverguild) {

		if(this.caches[serverguild] != null) {
			return this.caches[serverguild];
		}

		// If it didn't find a server cache we have to create one.

		this.logger.local('New server detected! Creating cache for server: ' + serverguild);
		// Insert server into database
		await this.mysqlCon.query('INSERT INTO cogs.servers (guild) VALUES (?)', serverguild);

		// Create server cache
		const result = await this.mysqlCon.query('SELECT * FROM cogs.servers WHERE guild = ?', [serverguild]);


		await this.createCache(result.results[0]);
		this.logger.local('New server cache created! ' + result.results[0].guild);


		return this.caches[result.guild];

	}
}

module.exports = ServerCacheManager;
