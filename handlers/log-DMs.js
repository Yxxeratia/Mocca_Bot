const {ChannelType} = require('discord.js');

module.exports = {
    name: 'logDMs',
    execute: async (client, message) => {
        if (message.author.id != client.user.id && message.channel.type === ChannelType.DM) {
            console.log(`New message from ${message.author.username}: ` + message.content);
        }
    }
}