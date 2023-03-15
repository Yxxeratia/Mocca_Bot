const {ChannelType} = require('discord.js');

//message to specific channel

module.exports = {
    name: 'msg',
    execute: async (client, channelName, message, content) => {
        if (content.length === 0) return await message.channel.send("Please include a message to send");

        const channel = client.channels.cache.find(channel => (channel.type === ChannelType.GuildText && channel.name === channelName));
        if (!channel) return message.channel.send("Channel not found");
       
        //remove commas from content
        await channel.send(content.join(' '));
    }
}