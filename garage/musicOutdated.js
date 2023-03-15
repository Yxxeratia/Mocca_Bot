const voiceConnObj = require('../handlers/voiceConn');
const Discord = require('@discordjs/voice');
const play = require('play-dl');
const {EmbedBuilder} = require('discord.js');


//music handlers

module.exports = {
    name: 'music',
    description: "Music-related commands",
    playVideo: async (client, message, server, track) => {

        //get user's vc
        const channel = message.member.voice.channel;

        //get bot's current connection
        let voiceConnection = Discord.getVoiceConnection(message.guild.id);
        //if no connection => connect
        if (!voiceConnection) {
            voiceConnection = await voiceConnObj.join(client, message);
        }

        const queuedTrack = await module.exports.queueVideo(message, server, track);

        if (server.isPlaying) {
            return;
        }

        let url = queuedTrack.url;

        //if (!url) return message.channel.send('Please provide a url');

        //this is a promise
        let stream = await play.stream(url);
        //create resource and player
        let resource = Discord.createAudioResource(stream.stream, {
            inputType: stream.type
        })

        let player = Discord.createAudioPlayer({
            behaviors: {
                noSubscriber: Discord.NoSubscriberBehavior.Play
            }
        })

        //play (need to subscribe)
        player.play(resource);
        voiceConnection.subscribe(player);
        
        //handle error
        player.on("error", (error) => {
            console.log(error);
        })
        
        player.on(Discord.AudioPlayerStatus.Playing, () => {
            message.channel.send(`<a:SpongeBobVibe:1032965578220113980> | Now playing: **${queuedTrack.title}**`);
            server.isPlaying = true;
        })

        player.on(Discord.AudioPlayerStatus.Idle, () => {
            server.isPlaying = false;
            if (server.index < server.queue.length - 1) {
                server.index++;
                module.exports.playVideo(client, message, server, server.queue[server.index]);
            }
            //auto disconnect 2 mins after user leaves vc
            if (!message.member.voice.channel) {
                setTimeout(() => {
                    message.channel.send(`<a:EssexRun:1032963554279686174> | Disconnected from **${channel.name}**`);
                    voiceConnection.destroy();
                }, 120000); 
            }
        })
    },
    queueVideo: async (message, server, track) => {
        if (track.startsWith('https') && play.yt_validate(track) === 'video') {
            let yt_info = await play.video_info(track);
            const queuedTrack = {title: yt_info.video_details.title, url: yt_info.video_details.url};
            server.queue.push(queuedTrack);
            message.channel.send(`Added **${queuedTrack.title}** to the current queue`);

            return queuedTrack;            
        }
        message.channel.send('Invalid url');
    },
    removeVideo: async (client, message, server, position) => {
        if (position > 0 && position <= songQueue.length) {
            songQueue.splice(position-1, 1);
        }
        else {
            await message.channel.send("Invalid position");
        }
    },
    showQueue: async (message, server) => {
        if (server.queue.length === 0) {
            return message.channel.send(":x: | Nothing is playing in queue");
        }
        /*CURRENTLY WORKING*/
        //if (trackPlaying)
        let currentPage = 0;
        //number of embeds = number of pages
        const embeds = generateQueueEmbed(server.queue);
        const queuedEmebed = await message.channel.send({
            content: `Current page: ${currentPage+1}/${embeds.length}`, 
            embeds: [embeds[currentPage]],
        });
        queuedEmebed.react('⬅️');
        queuedEmebed.react('➡️');

        const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && message.author.id === user.id;
        const collector = queuedEmebed.createReactionCollector(filter);

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '➡️') {
                //if not at the end, go to next page
                if (currentPage < embeds.length-1) {
                    currentPage++;
                    queuedEmebed.edit({
                        content: `Current page: ${currentPage+1}/${embeds.length}`, 
                        embeds: [embeds[currentPage]]
                    });
                }
            }
            else if (reaction.emoji.name === '⬅️') {
                //if not on the first page, go back
                if (currentPage != 0) {
                    currentPage--;
                    queuedEmebed.edit({
                        content: `Current page: ${currentPage+1}/${embeds.length}`, 
                        embeds: [embeds[currentPage]]
                    }); 
                }
            } 
        });
    }
}

function generateQueueEmbed(musicQueue) {
    const embeds = [];
    let cap = 10;
    for (let i = 0; i < musicQueue.length; i += 10) {
        const current = musicQueue.slice(i, cap);
        let j = i; 
        cap += 10;

        const info = current.map(track => `${++j}) [${track.title}](${track.url})`).join('\n\n');

        const embed = new EmbedBuilder()
            .setDescription(`**[Current Song: ${current[0].title}](${current[0].url})**\n\n${info}`);
        embeds.push(embed);
    }
    return embeds;
}
