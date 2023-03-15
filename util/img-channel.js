const {ChannelType, AttachmentBuilder} = require('discord.js');

module.exports = {
    name: 'sendImg',
    execute: async (client, channelName, message, content) => {
        if (content.length === 0) return await message.channel.send("Please include an image to send");

        const channel = client.channels.cache.find(channel => (channel.type === ChannelType.GuildText && channel.name === channelName));
        if (!channel) return message.channel.send("No such channel found");

        const attachment = new AttachmentBuilder(content.toString());
        await channel.send({files: [attachment]});
    }
}