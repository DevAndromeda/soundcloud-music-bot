module.exports = {
	name: 'volume',
	description: 'Volume command.',
	cooldown: 5,
	execute(message, args) {
		const { channel } = message.member.voice;
		if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		if (!args[0] || isNaN(args[0])) return message.channel.send(`The current volume is: **${serverQueue.volume}**`);
		// eslint-disable-next-line radix
		if (parseInt(args[0]) < 0 || parseInt(args[0]) > 100) return message.channel.send('Volume amount must be **greater than or equal to 0** or **less than or equal to 100**!');
		serverQueue.volume = parseInt(args[0]); // eslint-disable-line
		serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 200);
		return message.channel.send(`I set the volume to: **${serverQueue.volume}**`);
	}
};
