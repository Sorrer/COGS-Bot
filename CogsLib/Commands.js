const walkSync = require('walk-sync');


class Commands {


	constructor(commands_folder, logger) {
		this.commands_folder = commands_folder;
		this.commands = [];

		this.logger = logger;
	}

	load() {
		this.walkCommands(this.commands_folder);
	}

	walkCommands(dir) {
		const commandPaths = walkSync(dir, { directories: false });

		for(const path of commandPaths) {
			try{
				this.loadCommand('../' + this.commands_folder + '/' + path);
			}
			catch(e) {
				this.logger.localErr('Command Invalid. Couldn\'t find file or file error.\n' + e, true);
			}
		}

	}

	loadCommand(filePath) {
		this.logger.local(`Grabbing Command: '${filePath}'`);
		const command = require(filePath);

		this.logger.local(`Verifying Command '${filePath}'`);
		const verified = this.verifyCommand(command);

		if(!verified) {
			this.logger.localErr(`Failed to verify command '${filePath}'`);
			return;
		}

		this.logger.local(`Loading Command: '${command.description.name}'`);

		this.commands.push(command);

		this.logger.local(`Successfully loaded command: '${command.description.name}'`);

	}

	verifyCommand(command) {
		if(!command.settings) {
			this.logger.localErr('Failed to verify command - No settings found');
			return false;
		}
		else{
			// TODO: Verify all settings requirements here
		}

		if(!command.description) {
			this.logger.localErr('Failed to verify command - No description found');
			return false;
		}
		else{
			const description = command.description;
			const errDescription = 'Failed to verify command descrption - ';

			let descriptionFailed = false;

			if(!description.command) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' command not set. ');
			}

			if(!description.name) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' name not set. ');
			}

			if(!description.description) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' description not set. ');
			}

			if(!description.usage) {
				descriptionFailed = true;
				this.logger.localErr(errDescription + ' usage not set. ');
			}

			if(descriptionFailed) {
				return false;
			}
		}


		if(!command.execute) {
			this.logger.localErr('Failed to verify command - No execute function found');
			return false;
		}

		return true;
	}
}


module.exports = Commands;
