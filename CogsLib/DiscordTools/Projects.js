const Discord = require('discord.js');

class Projects {
	constructor(cache) {
		this.cache = cache;
		this.projects = {};
	}


	// Helpers
	async init() {
		this.setProjectListingChannel(await this.cache.getChannel('projectlisting'));
		this.projectsCategory = await this.cache.getChannel('projects');
	}

	enabled() {
		return this.projectsCategory != null;
	}

	async setProjectsCategory(channel) {
		this.projectsCategory = this.cache.guild.channels.resolve(channel);

		if(this.projectsCategory == null) {
			return;
		}

		if(this.projectsCategory.type != 'category') {
			await this.cache.logger.log('Warning - Projects tag is not category', 'Please set the projects tag to a **category** instead of a channel');
			this.projectsCategory = null;
			return;
		}
	}

	async setProjectListingChannel(channel) {
		this.projectListingChannel = this.cache.guild.channels.resolve(channel);

		if(this.projectListingChannel == null) {
			return;
		}

		if(this.projectListingChannel.type != 'text') {
			await this.cache.logger.log('Warning - Project Listing tag is not category', 'Please set the projectlistings tag to a text channel');
			this.projectListingChannel = null;
		}
	}

	async generateProjectEmbed(projectid) {
		if(this.projects[projectid] == null) {
			await this.generateProjectData(projectid);
		}

		if(this.projects[projectid] == false) {
			return null;
		}
		const project = this.projects[projectid];
		const embed = new Discord.MessageEmbed();
		embed.setColor('#ffffff')
			.setTitle(project.title)
			.setDescription(project.description);

		embed.addFields(
			{ name: 'Owner', value: '<@' + project.ownerid + '>', inline: true },
			{ name : 'Members', value: project.memberids.length + 1, inline: true },
			{ name: 'ID', value: projectid, inline: true }
		);

		return embed;
	}

	async generateProjectData(projectid) {


		const projectInfo = await this.cache.mysqlCon.query('SELECT * FROM cogsprojects.projects WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);


		if(projectInfo.results[0] == null) {
			this.projects[projectid] = false;
			return;
		}

		const projectChannels = await this.cache.mysqlCon.query('SELECT * FROM cogsprojects.channels WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);

		const projectChannelsArr = [];

		if(projectChannels.results[0] != null) {
			for(const result of projectChannels.results) {
				projectChannelsArr.push(result.channelid);
			}
		}

		const members = await this.cache.mysqlCon.query('SELECT * FROM cogsprojects.members WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);

		const membersArr = [];

		if(members.results[0] != null) {
			for(const result of members.results) {
				membersArr.push(result.memberid);
			}
		}


		const project = {
			id: projectid,
			title: projectInfo.results[0].title.toString('utf-8'),
			description: projectInfo.results[0].description.toString('utf-8'),
			ownerid: projectInfo.results[0].ownerid,
			textchannelid: projectInfo.results[0].textchannelid,
			voicechannelid: projectInfo.results[0].voicechannelid,
			categoryid: projectInfo.results[0].categoryid,
			channelids: projectChannelsArr,
			memberids: membersArr
		};


		this.projects[projectid] = project;
		return project;

	}

	async getProjectFromChannel(channelid) {
		const projectResults = await this.cache.mysqlCon.query('SELECT projectid FROM cogsprojects.projects WHERE textchannelid = ?', [channelid]);

		if(projectResults.results[0] != null) {
			return await this.get(projectResults.results[0].projectid);
		}
		else{
			return null;
		}

	}

	// Core usages
	async get(projectid) {

		if(this.projects[projectid] == false) {
			return null;
		}

		if(this.projects[projectid] == null) {
			await this.generateProjectData(projectid);
		}

		return this.projects[projectid];

	}

	async has(projectid) {

		if(this.projects[projectid] == null) {
			await this.generateProjectData(projectid);
		}

		if(this.projects[projectid] == false) {
			return false;
		}


		return true;
	}


	async create(info, name, ownerid) {

		if(this.projectsCategory == null) {
			return 'no-category';
		}

		const ownerlimitResults = await this.cache.mysqlCon.query('SELECT projectid FROM cogsprojects.projects WHERE serverid = ? AND ownerid = ?', [this.cache.serverid, ownerid]);

		if(ownerlimitResults.results[0] != null) {
			return 'already-has-project';
		}

		// Create channels and add owner to channels
		const textChannel = await this.cache.channeltools.createChannel(name, this.projectsCategory, 'text');
		const voiceChannel = await this.cache.channeltools.createChannel(name + ' Voice', this.projectsCategory, 'voice');


		await this.cache.channeltools.addProjectUser(textChannel, ownerid, true);
		await this.cache.channeltools.addProjectUser(voiceChannel, ownerid, true);


		// Create mysql enteries
		const sql = 'INSERT INTO cogsprojects.projects (serverid, ownerid, title, description, textchannelid, voicechannelid) VALUES (?,?,?,?,?,?)';

		await this.cache.mysqlCon.query(sql, [this.cache.serverid, ownerid, name, info, textChannel.id, voiceChannel.id]);

		const results = await this.cache.mysqlCon.query('SELECT projectid FROM cogsprojects.projects WHERE serverid = ? AND ownerid = ?', [this.cache.serverid, ownerid]);

		if(results.results[0] == null) {
			this.logger.localErr('Failed to generate project. Internal error. Could not recieve projectid after creating it', true);
			return 'failed';
		}

		const projectid = results.results[0].projectid;

		const projectMessage = await textChannel.send('Projectid: ' + projectid + '\n INSERT HOW TO MESSAGE HERE');
		projectMessage.pin();
		// Setup cache
		await this.generateProjectData(projectid);

		await this.updateProjectListing(projectid);

		await this.cache.logger.log('Successfully Created Project', `Project **${name}** created!\nOwner: <@${ownerid}>\nDescription:\n> ${info}\nID: ${projectid}`);

		return projectid;
	}

	async delete(projectid) {
		const project = await this.get(projectid);

		if(project == null) return;

		await this.cache.channeltools.deleteChannel(project.textchannelid);
		await this.cache.channeltools.deleteChannel(project.voicechannelid);


		for(const channelid of project.channelids) {
			await this.cache.channeltools.deleteChannel(channelid);
		}

		await this.deleteProjectListing(projectid);

		await this.cache.mysqlCon.query('DELETE FROM cogsprojects.channels WHERE serverid = ? AND projectid = ?', [this.cache.serverid, projectid]);
		await this.cache.mysqlCon.query('DELETE FROM cogsprojects.members WHERE serverid = ? AND projectid = ?', [this.cache.serverid, projectid]);
		await this.cache.mysqlCon.query('DELETE FROM cogsprojects.projects WHERE serverid = ? AND projectid = ?', [this.cache.serverid, projectid]);

		await this.cache.logger.log('Deleted Project', `Project **${project.title}** deleted!\nOwner: <@${project.ownerid}>\nDescription:\n> ${project.description}\nID: ${projectid}`);

		delete this.projects[projectid];
	}

	async createChannel(name, projectid, type) {
		if(type != 'text' && type != 'voice') {
			this.cache.logger.localErr('Tried to create project channel with invalid type \'' + type + '\'');
			return null;
		}

		if(!this.enabled()) return;

		const project = await this.get(projectid);

		if(project == null) {
			this.generateProjectData(projectid);
		}

		if(project == false) {
			return;
		}

		const categoryTest = this.cache.guild.channels.resolve(project.categoryid);

		if(project.categoryid == null || categoryTest == null) {
			const newCategory = await this.cache.channeltools.createChannel(project.title, false, 'category');

			await newCategory.setPosition(this.projectsCategory.position + 1);
			await newCategory.overwritePermissions([{
				id: this.cache.bot.user.id,
				allow: ['VIEW_CHANNEL']
			}, {
				id: this.cache.guild.roles.everyone,
				deny: ['VIEW_CHANNEL']
			}]);

			this.projects[projectid].categoryid = newCategory.id;
			project.categoryid = newCategory.id;
			await this.cache.mysqlCon.query('UPDATE cogsprojects.projects SET categoryid = ? WHERE projectid = ? AND serverid = ?', [newCategory.id, projectid, this.cache.serverid]);

		}

		const newChannel = await this.cache.channeltools.createChannel(name, project.categoryid, type);

		await this.cache.mysqlCon.query('INSERT INTO cogsprojects.channels (serverid, projectid, channelid, channeltype) VALUES (?,?,?, ?)', [this.cache.serverid, projectid, newChannel.id, type]);

		this.projects[projectid].channelids.push(newChannel.id);

		for(const userid of this.projects[projectid].memberids) {
			this.cache.channeltools.addProjectUser(newChannel, userid, false);
		}

		this.cache.channeltools.addProjectUser(newChannel, project.ownerid, true);

		await this.cache.logger.log('Created channel for project', 'Created channel <#' + newChannel.id + '> for project ' + project.title);

		return newChannel;
	}


	async deleteChannel(channelid, projectid) {

		const project = await this.get(projectid);

		if(project == null || project == false) {
			return 'invalid-project';
		}

		if(!project.channelids.includes(channelid)) {
			return 'invalid-channel';
		}


		await this.cache.channeltools.deleteChannel(channelid);

		await this.cache.mysqlCon.query('DELETE FROM cogsprojects.channels WHERE channelid = ? AND projectid = ? AND serverid = ? LIMIT 1', [channelid, projectid, this.cache.serverid]);

		this.projects[projectid].channelids = this.projects[projectid].channelids.filter((item) => item !== channelid);


		await this.cache.logger.log('Deleted channel for project', 'Delete channel <#' + channelid + '> for project ' + this.projects[projectid].title);

		if(this.projects[projectid].channelids.length == 0) {
			const category = this.cache.guild.channels.resolve(this.projects[projectid].categoryid);

			category.delete();

			this.projects[projectid].categoryid = null;

			await this.cache.mysqlCon.query('UPDATE cogsprojects.projects SET categoryid = null WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);
		}


		return true;
	}


	async updateProjectListing(projectid) {

		if(this.projectListingChannel == null) {
			return;
		}

		const embed = await this.generateProjectEmbed(projectid);

		const projectListing = await this.cache.mysqlCon.query('SELECT messageid FROM cogsprojects.listings WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);
		if(projectListing.results[0] != null) {
			try{
				const message = await this.projectListingChannel.messages.fetch(projectListing.results[0].messageid);
				if(message != null) {
					await message.edit(embed);
					return;
				}
			}
			catch(e) {
				//
			}
		}

		const sentMessage = await this.projectListingChannel.send(embed);

		await this.cache.mysqlCon.query('INSERT INTO cogsprojects.listings (serverid, projectid, messageid) VALUES (?,?,?) ON DUPLICATE KEY UPDATE messageid = ? ', [this.cache.serverid, projectid, sentMessage.id, sentMessage.id]);

	}

	async deleteProjectListing(projectid) {
		if(this.projectListingChannel == null) {
			return;
		}

		const projectListing = await this.cache.mysqlCon.query('SELECT messageid FROM cogsprojects.listings WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);

		if(projectListing.results[0] != null) {
			const message = await this.projectListingChannel.messages.fetch(projectListing.results[0].messageid);

			if(message != null) {
				await message.delete();
			}
		}

		await this.cache.mysqlCon.query('DELETE FROM cogsprojects.listings WHERE projectid = ? AND serverid = ?', [projectid, this.cache.serverid]);
	}

	async hasMember(projectid, userid) {
		const project = await this.get(projectid);
		if(project == null) return null;

		if(project.ownerid == userid || project.memberids.includes(userid)) return true;


		return false;

	}

	async addMember(projectid, userid) {
		const project = await this.get(projectid);
		if(project == null) return;

		const isOwner = project.ownerid == userid;

		await this.cache.channeltools.addProjectUser(project.textchannelid, userid, isOwner);
		await this.cache.channeltools.addProjectUser(project.voicechannelid, userid, isOwner);

		for(const channelid of project.channelids) {
			await this.cache.channeltools.addProjectUser(channelid, userid, isOwner);
		}

		const textchannel = await this.cache.guild.channels.resolve(project.textchannelid);


		if(!isOwner) {
			await this.cache.mysqlCon.query('INSERT INTO cogsprojects.members (serverid, projectid, memberid) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE memberid = ?', [this.cache.serverid, projectid, userid, userid]);

			if(!project.memberids.includes(userid)) {
				project.memberids.push(userid);
			}

		}

		await textchannel.send('<@' + userid + '> has joined the project!');
		await this.cache.logger.log('User joined project', '<@' + userid + '> joined *' + project.title + '*', '#00ed04');
		await this.updateProjectListing(projectid);
	}

	async removeMember(projectid, userid) {
		const project = await this.get(projectid);
		if(project == null) return;

		await this.cache.channeltools.removeUserChannelPermissions(project.textchannelid, userid);
		await this.cache.channeltools.removeUserChannelPermissions(project.voicechannelid, userid);

		for(const channelid of project.channelids) {
			await this.cache.channeltools.removeUserChannelPermissions(channelid, userid);
		}

		await this.cache.mysqlCon.query('DELETE FROM cogsprojects.members WHERE serverid = ? AND projectid = ? AND memberid = ?', [this.cache.serverid, projectid, userid]);

		console.log(project.memberids + ' waut');

		project.memberids = project.memberids.filter((item) => {
			console.log(item != userid);
			return item != userid;

		});

		console.log(project.memberids);

		const textchannel = await this.cache.guild.channels.resolve(project.textchannelid);
		await textchannel.send('<@' + userid + '> has left the project.');
		await this.cache.logger.log('User left project', '<@' + userid + '> left *' + project.title + '*', '#ff1974');
		await this.updateProjectListing(projectid);
	}


	async changeTitle(title, projectid, setName = false) {
		const project = await this.get(projectid);

		if(project == null || project == false) {
			return 'invalid-project';
		}

		if(title.length <= 2) {
			return 'title must have more than 2 letters';
		}


		const lastTitle = project.title;
		project.title = title;
		this.projects[projectid].title = title;

		if(setName) {

			const ntextchannel = this.cache.guild.channels.resolve(project.textchannelid);
			const nvoicechannel = this.cache.guild.channels.resolve(project.voicechannelid);

			await ntextchannel.setName(title);
			await nvoicechannel.setName(title + ' Voice');

			const category = this.cache.guild.channels.resolve(project.categoryid);

			if(category != null) {
				await category.setName(title);
			}

		}
		await this.updateProjectListing(projectid);

		await this.cache.mysqlCon.query('UPDATE cogsprojects.projects SET title = ? WHERE projectid = ? AND serverid = ?', [title, projectid, this.cache.serverid]);

		await this.cache.logger.log('Updated Project Title to ' + title, 'Changed from *' + lastTitle + '* to *' + title + '*');

		return true;
	}

	async changeDescription(description, projectid) {
		const project = await this.get(projectid);

		if(project == null || project == false) {
			return 'invalid-project';
		}

		const oldDescription = project.description;

		project.description = description;
		this.projects[projectid].description = description;

		await this.cache.mysqlCon.query('UPDATE cogsprojects.projects SET description = ? WHERE projectid = ? AND serverid = ?', [description, projectid, this.cache.serverid]);

		await this.updateProjectListing(projectid);

		await this.cache.logger.log('Changed description for ' + project.title, +'Old Description:\n' + oldDescription + 'New Description:\n' + description);

		return true;
	}
}


module.exports = Projects;
