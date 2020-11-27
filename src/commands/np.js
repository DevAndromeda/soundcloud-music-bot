const { MessageEmbed } = require('discord.js');
const progressbar = require('string-progressbar');
const ms = require('parse-ms');
const getProgress = dur => `${ms(dur).hours ? `${ms(dur).hours}:` : ''}${ms(dur).minutes}:${ms(dur).seconds}`;

module.exports = {
	name: 'np',
	description: 'Now playing command.',
	cooldown: 5,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		const [progress] = progressbar(serverQueue.songs[0].duration, serverQueue.connection.dispatcher.streamTime, 15);
		const embed = new MessageEmbed()
			.setAuthor('Now Playing')
			.setDescription(`**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
			.addField('Author', `**[${serverQueue.songs[0].author.name}](${serverQueue.songs[0].author.url})**`)
			.setFooter(`${getProgress(serverQueue.connection.dispatcher.streamTime)} ${progress} ${getProgress(serverQueue.songs[0].duration)}`)
			.setColor('RANDOM')
			.setThumbnail(serverQueue.songs[0].thumbnail);

		return message.channel.send(embed);
	}
};
