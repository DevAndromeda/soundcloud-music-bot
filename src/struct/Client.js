const { Client, Collection } = require('discord.js');
const SoundCloud = require('soundcloud-scraper');

module.exports = class extends Client {
	constructor(config) {
		super({
			disableMentions: 'everyone'
		});

		this.commands = new Collection();

		this.cooldowns = new Collection();

		this.queue = new Map();

		this.config = config;

		this.soundcloud = new SoundCloud.Client(this.config.soundcloud);
	}
};
