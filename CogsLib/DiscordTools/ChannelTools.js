class ChannelTools {
	constructor(cache) {
		this.cache = cache;

		this.cache.logger.local('Loaded channel tools');
	}

	async createChannel(channelName, categoryID, channelType = 'text') {
		const guild = this.cache.guild;
		const channels = guild.channels;
		const logger = this.cache.logger;

		const category = channels.resolve(categoryID);

		if(category == null && categoryID != false) {
			logger.logErr('Tried to create channel for invalid categoryID', 'Could not find categoryID - ' + categoryID);
			return 'failed-invalid-channel';
		}

		const newChannel = await channels.create(channelName, {
			type: channelType,
			parent: category
		});

		this.cache.logger.log('Created new channel \'' + channelName + '\'', '<#' + newChannel.id + '>');
		return newChannel;

	}

	async deleteChannel(channelid) {
		const channel = this.cache.guild.channels.resolve(channelid);

		if(channel == null) {
			this.cache.logger.local('Tried to delete invalid channel. ' + channelid);
			return;
		}

		const archiveid = await this.cache.getChannel('archive');

		if(archiveid != null) {
			const archiveCategory = this.cache.guild.channels.resolve(archiveid);

			if(archiveCategory.type == 'category') {
				await this.cache.logger.log('Moving channel to archive.', '<#' + channelid + '>');
				await channel.setParent(archiveCategory);
				return;
			}
		}

		await channel.delete();
		await this.cache.logger.log('Deleted channel', channel.name);
	}

	async addProjectUser(channelResolve, userResolve, isOwner = false) {
		const channel = this.cache.guild.channels.resolve(channelResolve);
		const user = this.cache.guild.members.resolve(userResolve);
		if(channel == null) {
			this.cache.logger.logErr('Failed to add project user', 'Channel does not exist. ' + channelResolve);
			return false;
		}

		if(user == null) {
			this.cache.logger.logErr('Failed to add project user', 'User does not exist. ' + userResolve);
			return false;
		}

		try{
			if(isOwner) {
				channel.updateOverwrite(user, {
					VIEW_CHANNEL: true,
					MANAGE_MESSAGES: true
				});
			}
			else{
				channel.updateOverwrite(user, {
					VIEW_CHANNEL: true
				});
			}

			// this.cache.logger.log('Added user to project channel', '<@' + user.id + '> add', '#00ed04');
			return true;
		}
		catch(error) {
			this.cache.logger.logErr('Failed to add project user', 'Failed to add user <@' + user.id + '> to <#' + channel.id + '>');
			this.cache.logger.localErr(error, true);
		}

		return false;

	}

	async removeUserChannelPermissions(channelResolve, userResolve) {
		const channel = this.cache.guild.channels.resolve(channelResolve);
		const user = this.cache.guild.members.resolve(userResolve);
		if(channel == null) {
			this.cache.logger.logErr('Failed to remove user from channel', 'Channel does not exist. ' + channelResolve);
			return false;
		}

		if(user == null) {
			this.cache.logger.logErr('Failed to remove user from channel', 'User does not exist. ' + userResolve);
			return false;
		}

		const perms = channel.permissionOverwrites.get(user.id);

		if(perms) {
			await perms.delete();
			return true;
		}

		return false;

	}


}

module.exports = ChannelTools;
