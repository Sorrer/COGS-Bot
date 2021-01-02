// ServerCache holds all mysql serverdata for this serverless

// ServerCache can contain the following
// Command prefix
// Log channel
// Project Listing Channel


class ServerCache {
	constructor() {
		this.prefix = ';';
		this.cleanCommands = true;
		this.testServer = false;
	}
}

module.exports = ServerCache;
