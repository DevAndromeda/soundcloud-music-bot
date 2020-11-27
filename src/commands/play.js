const { Util } = require('discord.js');
const { Util: SoundCloudUtil } = require('soundcloud-scraper');

module.exports = {
	name: 'play',
	description: 'Play command.',
	usage: '[song_url/song_name]',
	args: true,
	cooldown: 5,
	async execute(message, args) {
		const { channel } = message.member.voice;
		if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		if (!permissions.has('SPEAK')) return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');

		const serverQueue = message.client.queue.get(message.guild.id);
		const query = args.join(' ').replace(/<(.+)>/g, '$1');
		let songInfo;
		const loadingMessage = await message.channel.send('⏱ | Parsing Track...');

		if (SoundCloudUtil.validateURL(query)) {
			songInfo = await message.client.soundcloud.getSongInfo(query).catch(e => { console.error(`Track parse error: ${e}`); });
			if (!songInfo) return loadingMessage.edit('Could not parse song info');
		} else {
			const res = await message.client.soundcloud.search(query, 'track').catch(e => { console.error(`Track parse error: ${e}`); });
			if (!res) return loadingMessage.edit('Track not found.');

			songInfo = await message.client.soundcloud.getSongInfo(res[0].url).catch(e => { console.error(`Track parse error: ${e}`); });
			if (!songInfo) return loadingMessage.edit('Could not parse song info');
		}

		const song = {
			title: Util.escapeMarkdown(songInfo.title),
			url: songInfo.url,
			thumbnail: songInfo.thumbnail,
			duration: songInfo.duration,
			author: songInfo.author
		};

		Object.defineProperty(song, '_raw', { value: songInfo });

		loadingMessage.delete();

		if (serverQueue) {
			serverQueue.songs.push(song);
			console.log(serverQueue.songs);
			return message.channel.send(`✅ | Loaded track **${song.title}** by **${song.author.name}**!`);
		}

		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: channel,
			connection: null,
			songs: [],
			volume: 100,
			playing: true
		};
		message.client.queue.set(message.guild.id, queueConstruct);
		queueConstruct.songs.push(song);

		const play = async song => {
			const queue = message.client.queue.get(message.guild.id);
			if (!song) {
				queue.voiceChannel.leave();
				message.client.queue.delete(message.guild.id);
				return;
			}

			const dispatcher = queue.connection.play(await song._raw.downloadProgressive())
				.on('finish', () => {
					queue.songs.shift();
					play(queue.songs[0]);
				})
				.on('error', error => console.error(error));
			dispatcher.setVolumeLogarithmic(queue.volume / 200);
			queue.textChannel.send(`🎶 | Start playing: **${song.title}** by **${song.author.name}**!`);
		};

		try {
			const connection = await channel.join();
			queueConstruct.connection = connection;
			play(queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			message.client.queue.delete(message.guild.id);
			await channel.leave();
			return message.channel.send(`I could not join the voice channel: ${error}`);
		}
	}
};
