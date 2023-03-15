const {EmbedBuilder, ChannelType} = require('discord.js');


//message an Embed to specific channel

module.exports = {
    name: 'msgEmbed',
    execute: async (client, channelName, message, content) => {
        if (content.length === 0) return await message.channel.send("Please include a message to send");

        const channel = client.channels.cache.find(channel => (channel.type === ChannelType.GuildText && channel.name === channelName));
        if (!channel) return message.channel.send("No such channel found");

        const sent = await channel.send({
            embeds: [new EmbedBuilder() 
                //join(' ') to remove commas as separators from array "content"
                .setDescription(content.join(' '))
                .setTitle(":P")
                .setAuthor({name: message.member.nickname, iconURL: message.member.user.displayAvatarURL()})             
            ]
        });
        //delete after 8 min
        setTimeout(() => {
            sent.delete();
        }, 480000)
    }
}