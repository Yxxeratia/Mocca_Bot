const {ChannelType} = require('discord.js');

//message an Embed to specific channel

module.exports = {
    name: 'textConn',
    execute: async (client, channelName) => {
        const channel = client.channels.cache.find(channel => (channel.type === ChannelType.GuildText && channel.name === channelName));
        if (!channel) return message.channel.send("No such channel found");
        return channel;
    }
}