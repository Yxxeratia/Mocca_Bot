const Discord = require('discord.js');

module.exports = {
    name: 'userAvatar',
    execute: async (client, targetUsername, message) => {

        //get all members in server
        const fetchedMembers = await message.guild.members.fetch();

        //targetUsername in string
        const targetUsernameString = targetUsername.join(' ');
        //get length of targetUsername
        const argLength = targetUsernameString.length;


        //get member mentioned (@) or by nickname or by username
        const member = message.mentions.users.first() 
        || fetchedMembers.find(member => (member.nickname && member.nickname.slice(0, argLength) === targetUsernameString)) 
        || fetchedMembers.find(member => (member.user.username.slice(0, argLength) === targetUsernameString))


        if (!member) return message.channel.send("No user found");

        message.channel.send({
            embeds: [new Discord.EmbedBuilder()
                .setAuthor({ name: member.user.tag })
                //default to static png, dynamic gif 
                .setImage(member.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 }))
                .setTitle("Global Avatar")
                .setURL(member.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 }))
            ]
        })
    }
}