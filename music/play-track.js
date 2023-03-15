const Discord = require('@discordjs/voice');
const queueTrack = require('./queue-track'); 
const voiceConn = require('../handlers/voice-conn');
const play = require('play-dl');
const { Collection } = require('discord.js');


//collection of servers
let servers = new Collection();
//true if member's presence does not affect bot's ability to play queue (when there is a queue), false otherwise
let dependsOnMember = true;


module.exports = {
    name: 'playTrack',
    description: "play track(s) in queue",
    execute: async (client, message, server, track) => {

        /*VOICE CONNECTION*/
        //get user's vc
        const channel = message.member.voice.channel;
        //user not in vc and server queue empty
        if (!channel && server.queue.length === 0) return message.channel.send("<a:nyangiggle:852748008717549568> Join a voice channel first stupid");
        
        //get bot's current connection
        let voiceConnection = Discord.getVoiceConnection(message.guild.id);
        //no connection => connect to bot user's vc
        if (!voiceConnection) {
            voiceConnection = await voiceConn.join(message, channel);
        }
        else if (!voiceConn.sameVoiceChannel(client, message) && dependsOnMember) {
            //bot is playing music
            if (server.queue.length != 0 && !server.playerActive || server.playerActive) return message.channel.send("I'm playing music on another channel");

            voiceConnection = await voiceConn.join(message, channel); 
        }



        /*ERROR HANDLE WHILE QUEUEING*/
        let err = null; //err = 'none' => success, else => error
        //song is playing in queue (pausing counts) => queue then return
        if (server.playerActive) {  
            err = await queueTrack.execute(message, server, track);
            return err;
        }

        //queue is empty => queue then play
        if (server.queue.length == 0) {
            err = await queueTrack.execute(message, server, track);
            if (err != 'none') { 
                return err;
            }
        } 

        /*PLAY*/
        //1st song in queue is played
        let stream = await play.stream(server.queue[0].url);
        //create resource and player
        let resource = Discord.createAudioResource(stream.stream, {
            inputType: stream.type
        })

        let player = Discord.createAudioPlayer({
            behaviors: {
                noSubscriber: Discord.NoSubscriberBehavior.Play
            }
        })
        //play 
        player.play(resource);
        voiceConnection.subscribe(player);
        server.player = player;
        //register server to the server list
        if (servers.get(server.player) === undefined) {
            servers.set(server.player, server);
        }

        /*STATE CHANGES*/
        player.on("error", (error) => {
            console.log(error);
        })
        
        player.on(Discord.AudioPlayerStatus.Playing, () => {
            let currentServer = servers.get(player);
            
            //track is first played (not resumed)
            if (currentServer.queue[0].title && currentServer.queue[0].timeStamp === 0) {
                message.channel.send(`<a:SpongeBobVibe:1032965578220113980> | Now playing: **${currentServer.queue[0].title}**`);
                currentServer.playerActive = true;
            }
            
            try {
                currentServer.currentTimeStampInterval = setInterval(() => {
                    if (currentServer.queue.length != 0) {
                        currentServer.queue[0].timeStamp++; //increment every second 
                    }
                }, 1000)
            }
            catch(err) {
                console.log("Timestamp issues, dw abt it");
            }
        })

        player.on(Discord.AudioPlayerStatus.Paused, () => {
            //clear interval => maintain time stamp until resume 
            clearInterval(server.currentTimeStampInterval);
        })

        player.on(Discord.AudioPlayerStatus.Idle, async () => {
            let currentServer = servers.get(player);
            
            //deact player 
            currentServer.playerActive = false;

            //clear interval (stop incrementing song's time stamp)
            clearInterval(currentServer.currentTimeStampInterval);

            //repeat queue (and not track) or is skipped while queue is on repeat
            if ((!currentServer.repeatTrack || currentServer.skipped) && currentServer.repeatQueue && currentServer.queue.length != 0) {
                let track = currentServer.queue.shift();
                currentServer.queue.push(track);
            }
            //track ends normally without queue repeat
            else if ((!currentServer.repeatTrack && !currentServer.skipped || currentServer.skipped) && currentServer.queue.length != 0) {
                currentServer.queue.shift();
            }
            //need to check if prev track was skipped before changing back to false
            currentServer.skipped = false;

            //queue is not empty => play next song
            if (currentServer.queue.length != 0) {
                //reset time stamp (in case of repeatTrack)
                currentServer.queue[0].timeStamp = 0;
                dependsOnMember = false;
                await module.exports.execute(client, currentServer.lastPlayMessage, currentServer, currentServer.queue[0]); 
            }
            //when user leaves while bot is playing (refer to voice state update in index.js) 
            else {
                dependsOnMember = true;
                let botVoiceConnection = Discord.getVoiceConnection(currentServer.guild.id);
                let channel = currentServer.guild.channels.cache.find(channel => (channel.id === botVoiceConnection.joinConfig.channelId));
                //leave
                if (channel && channel.members.size === 1) {
                    currentServer.dcTimeOut = setTimeout(() => {
                        botVoiceConnection.disconnect();
                        currentServer.lastPlayMessage.channel.send(`<a:EssexRun:1032963554279686174> | Disconnected from **${channel.name}** due to inactivity`);
                    }, 120000);
                }
            }
            
        })
        return err;
    },
}
