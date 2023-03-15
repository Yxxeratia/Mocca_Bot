const { ChannelType } = require('discord.js');
const clearQueue = require('../music/clear-queue');
const Discord = require('@discordjs/voice');

//join and leave
module.exports = {
    name: 'voiceConn',
    description: "Handle voice connection",
    join: async (message, channel) => {

        //join vc
        const voiceConnection = Discord.joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })
        await message.channel.send(`<a:SandyRunning:1032962978632445962> | Joined **${channel.name}** !`);
        return voiceConnection;
    }, 

    leave: (client, message, server) => {

        //user's vc
        const userVoiceChannel = message.member.voice.channel;
        
        //bot's current connection
        const curConnection = Discord.getVoiceConnection(message.guild.id);

        if (!curConnection) {
            message.channel.send("<a:2DSmack:852748007648526387> Silly goose, I'm currently not on a voice channel");
        }
        //bot on same vc with user
        else if (module.exports.sameVoiceChannel(client, message)) {
            curConnection.disconnect();
            message.channel.send(`<a:EssexRun:1032963554279686174> | Disconnected from **${userVoiceChannel.name}**`);
            
            //queue is not empty
            if (server.queue.length != 0) {
                server.playerActive = false //deact player when dc
                clearQueue.forceClear(message, server); //clear queue
            }
        }
        else {
            message.channel.send("<a:no:1033053158961856613> No can do, we're not on the same voice channel");
        }
    },

    sameVoiceChannel: (client, message) => {
        //user's vc
        const userVoiceChannel = message.member.voice.channel;

        //get bot's vc
        const botVoiceChannel = message.guild.channels.cache.find(channel => (channel.type === ChannelType.GuildVoice && channel.members.has(client.user.id)));
        
        //true if bot is in the same vc as user 
        return (userVoiceChannel === botVoiceChannel);
    },
}   
