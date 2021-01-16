// ServerCache holds all mysql serverdata for this serverless

// ServerCache can contain the following
// Command prefix
// Log channel
// Project Listing Channel

const ChannelTools = require('../DiscordTools/ChannelTools.js');
const Projects = require('../DiscordTools/Projects.js');


class ServerCache {
	constructor(mysqlCon, logger, serverGuild = 'default', bot = null) {
		this.mysqlCon = mysqlCon;
		this.serverGuild = serverGuild;

		this.logger = logger;

		this.bot = bot;

		this.channels = {};
		this.settings = {};
		this.roles = {};

		if(serverGuild === 'default') {
			this.prefix = ';';
			this.testServer = false;
		}
		else{
			this.load();
		}
	}

	async load() {
		if(this.serverGuild === 'default') {
			return;
		}


		let serverinfo = await this.mysqlCon.query('SELECT * FROM cogs.servers WHERE guild = ?', [ this.serverGuild]);

		if(!serverinfo.results[0]) {
			this.logger.local('Creating server id for this server');

			this.mysqlCon.query('INSERT INTO cogs.servers (guild) VALUES (?)', this.serverGuild);

			serverinfo = await this.mysqlCon.query('SELECT * FROM cogs.servers WHERE guild = ?', [ this.serverGuild]);

			if(!serverinfo.results[0]) {
				this.logger.localErr('Failed to insert/recieve serverinfo from database.');
				return;
			}
		}

		this.serverid = serverinfo.results[0].id;

		this.guild = await this.bot.guilds.fetch(this.serverGuild);


		// Get command prefix if available
		const prefixResults = await this.mysqlCon.query('SELECT prefix FROM cogs.serverprefixes WHERE serverid = ?', [this.serverid]);

		if(prefixResults.results[0]) {
			this.prefix = prefixResults.results[0].prefix;
		}
		else{
			this.prefix = ';';
		}

		this.logger.local('Server prefix: ' + ';');

		this.logger.local('Server info retrieved. Server id = ' + this.serverid);

		await this.loadSettings();

		await this.loadTools();
		await this.loadChannels();


	}

	async loadTools() {
		this.channeltools = new ChannelTools(this);
		this.projects = new Projects(this);
		await this.projects.init();

	}

	async reload() {
		if(this.serverGuild === 'default') {
			return;
		}

		await this.load();
	}


	async loadSettings() {
		if(this.serverid == null) {
			return;
		}

		const results = await this.mysqlCon.query('SELECT * FROM cogs.serversettings WHERE serverid = ?', [this.serverid]);

		for(const result of results.results) {
			this.settings[result.setting] = result.value;
		}

	}

	async loadRoles() {
		if(this.serverid == null) {
			return;
		}

		const results = await this.mysqlCon.query('SELECT * FROM cogs.serverroles WHERE serverid = ?', [this.serverid]);

		for(const result of results.results) {
			this.roles[result.roleid] = result.privilege;
		}

	}

	async loadChannels() {
		if(this.serverid == null) {
			return;
		}

		const results = await this.mysqlCon.query('SELECT * FROM cogs.serverchannels WHERE serverid = ?', [this.serverid]);

		for(const row of results.results) {
			await this.updateChannelSystem(row.tag, row.channelid);
		}

	}

	async updateChannelSystem(tag, channelid) {

		switch(tag) {

		case 'logchannel':
			await this.logger.setLogChannel(channelid);
			break;
		case 'projectlistings':
			await this.projects.setProjectListingChannel(channelid);
			break;
		case 'projects':
			await this.projects.setProjectsCategory(channelid);
			break;
		}
	}

	// TODO: Switch queries to prepared statements if bot gets too performant heavy for server


	// Getters and Setters

	async setPrefix(prefix) {

		await this.mysqlCon.query('INSERT INTO cogs.serverprefixes (serverid, prefix) VALUES (?, ?) ON DUPLICATE KEY UPDATE prefix = ?', [this.serverid, prefix, prefix]);

		this.prefix = prefix;
	}

	async setSetting(setting, value) {
		if(typeof (value) != 'number' || typeof (setting) != 'string') {
			this.logger.localErr('Can not update setting. Requires an integer for setting value, and a string for the setting name.', true);
			return;
		}

		await this.mysqlCon.query('INSERT INTO cogs.serversettings (serverid, setting, value) VALUES (? , ?, ?) ON DUPLICATE KEY UPDATE value = ?', [this.serverid, setting, value, value]);

		this.settings[setting] = value;
	}


	async getSetting(setting) {
		if(typeof (setting) !== 'string') {
			this.logger.localErr('Can not get setting. Requires a string name to retrieve', true);
			return;
		}

		if(this.settings[setting] != null) {
			return this.settings[setting];
		}

		const results = await this.mysqlCon.query('SELECT value FROM cogs.serversettings WHERE serverid = ? AND setting = ?', [this.serverid, setting]);

		if(results.results[0]) {
			this.settings[setting] = results.results[0].value;
			return results.results[0].value;
		}
		else{
			this.settings[setting] = 0;
			return null;
		}
	}


	async setChannel(tag, id) {
		this.logger.local([this.serverid, id, tag, id]);
		await this.mysqlCon.query('INSERT INTO cogs.serverchannels (serverid, channelid, tag) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE channelid = ?', [this.serverid, id, tag, id]);

		this.channels[tag] = id;

		await this.updateChannelSystem(tag, id);
	}

	/**
	* Returns channel ID
	*/
	async getChannel(tag) {
		if(this.channels[tag] != null) {
			return this.channels[tag];
		}

		const results = await this.mysqlCon.query('SELECT tag, channelid FROM cogs.serverchannels WHERE serverid = ? AND tag = ?', [this.serverid, tag]);

		if(results.results[0]) {
			this.channels[results.results[0].tag] = results.results[0].channelid;
			return results.results[0].channelid;
		}
		else{
			return null;
		}

	}


	async setRole(roleid, privilege) {
		privilege = parseInt(privilege, 10);

		if(privilege >= 1000) {
			this.logger.logErr('Privilege value set too high! Can\'t use it, use a number lower than 1000');
			return false;
		}

		await this.mysqlCon.query('INSERT INTO cogs.serverroles (serverid, roleid, privilege) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE privilege = ?', [this.serverid, roleid, privilege, privilege]);

		this.roles[roleid] = privilege;
	}

	async getRole(roleid) {
		if(this.roles[roleid] != null) {
			return this.roles[roleid];
		}

		const results = await this.mysqlCon.query('SELECT privilege FROM cogs.serverroles WHERE serverid = ? AND roleid = ?', [this.serverid, roleid]);

		if(results.results[0]) {
			this.roles[roleid] = results.results[0].privilege;
			return results.results[0].privilege;
		}
		else{
			return null;
		}
	}

	// TODO: Projects cache, get/set/create/delete;
	// TODO: Projects extra channel cache, get/set/create/delete;
	// TODO: Event channel cache, get/create/delete;
}

module.exports = ServerCache;
