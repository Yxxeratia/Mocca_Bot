const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, GuildDefaultMessageNotifications, 
    ActivityType, ChannelType, Partials, Collection, Presence, OAuth2Guild } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

require('dotenv').config();
const TOKEN = process.env.ACCESS_TOKEN;

const TwitterApi = require('twitter-api-v2');

const TwitchApi = require('node-twitch').default;
const TwitchId = process.env.TWITCH_CLIENT_ID;
const TwitchSecret = process.env.TWITCH_CLIENT_SECRET;
const twitch = new TwitchApi({
    client_id: TwitchId,
    client_secret: TwitchSecret,
})


const fs = require('fs');
const path = require('path');

const voiceConn = require('./handlers/voice-conn');
const textConn = require('./handlers/text-conn');
const purge = require('./util/purge');
const userAvatar = require('./util/user-avatar');
const msgEmbed = require('./util/message-embed-channel');
const msg = require('./util/message-channel');
const img = require('./util/img-channel');
const DM = require('./util/direct-message');
const logDM = require('./handlers/log-DMs');
const playTrack = require('./music/play-track');
const viewQueue = require('./music/view-queue');
const loopTrack = require('./music/loop-track');
const loopQueue = require('./music/loop-queue');
const skipTrack = require('./music/skip-track');
const removeTrack = require('./music/remove-track');
const nowPlaying = require('./music/now-playing');
const clearQueue = require('./music/clear-queue');
const pauseTrack = require('./music/pause-track');
const resumeTrack = require('./music/resume-track');
const help = require('./util/help');




/*DECLARED ONCE*/
//prefix
const prefix = 'm>';
//cache and find matched channel
let channelName = '';
//cache and find matched channel
let targetUsername = '';
//text channel return from textConn.js
let textChannel = null;
let invokingMember = null;


/*Note*/
//Include Partials.Channel to allow bot to read messages (for logging essentially)

const client = new Client({partials: [Partials.Channel], intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, 
    GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.GuildPresences]});

client.commands = new Collection();

//path to commands
const commandsPath = path.join(__dirname, 'commands');
//grab all files in commandsPath
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    //set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } 
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
    
//current song 
let currentSong = {name: null, artist: null, album: null};

let servers = {};

//bot on
client.on('ready', () => {
    console.log("Online");
    //name
    client.user.setUsername('Mocca');
    //status
    client.user.setStatus('dnd');
    //bot activity
    client.user.setActivity(`:D`, { type: ActivityType.Playing });
    //guild
    /*const guild = client.guilds.cache.get("473481851592507417");
    //channel
    const channel = guild.channels.cache.get("1079783127548960858");

    const frameDir = path.join(__dirname, 'big');
    const frameFiles = fs.readdirSync(frameDir);
    
    let count = parseInt(process.env.FRAME_COUNT);
    const frameInterval = setInterval(() => {
        console.log(count);
        if (count < frameFiles.length) {
            channel.send({content:`Chiisana Tsubomi no Sono Oku ni EP1?2?3??4 - Frame ${count+1} out of ${frameFiles.length}`, files: [{attachment: `${frameDir}\\${frameFiles[count++]}`}]});
            process.env.FRAME_COUNT = count;
        }
        else {
            channel.send('Fin');
            clearInterval(frameInterval);
        }
    }, 300000);*/

})

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    //guild
    const guild = client.guilds.cache.get("473481851592507417");
    //channel
    const channel = guild.channels.cache.get("478043140733927437");
    //member
    const member = await guild.members.fetch("852730444198051840");

    if (newPresence.member === member && newPresence.guild === guild) {
        //no activities
        if (member.presence.activities.length === 0) return;

        let status = member.presence.activities.find(activity => activity.type === ActivityType.Listening);

        if (status === undefined) return;
        if (currentSong.name != status.details || currentSong.artist != status.state || currentSong.album != status.assets.largeText) {
            let thumbnail = `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`, name = status.details, artist = status.state, album = status.assets.largeText;
            const embed = new EmbedBuilder()
                .setAuthor({name: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                .setTitle(`This nigga is listening to`)
                .setThumbnail(thumbnail)
                .addFields(
                    {
                        name: "Song:",
                        value: name,
                    },
                    {
                        name: "By:",
                        value: artist,
                    },
                    {
                        name: "Album:",
                        value: album,
                    }
                    )
            channel.send({embeds: [embed]});

            currentSong.name = name;
            currentSong.artist = artist;
            currentSong.album = album;
        }
        
    }
})

 //bot leaves vc (when user leaves AFTER bot finishes playing)
 client.on('voiceStateUpdate', (oldState, newState) => {
    let guild = newState.guild;

    let botVoiceConnection = getVoiceConnection(guild.id);
    if (!botVoiceConnection) return;

    let channel = guild.channels.cache.find(channel => (channel.id === botVoiceConnection.joinConfig.channelId));
    if (!channel) return;
    
    //dc when user leaves and queue is empty (prevent dc when user leaves while bot is switching track)
    if (!servers[guild.id].playerActive && servers[guild.id].queue.length === 0 && channel.members.size === 1) {
        servers[guild.id].dcTimeOut = setTimeout(() => {
            botVoiceConnection.disconnect();
            servers[guild.id].lastPlayMessage.channel.send(`<a:EssexRun:1032963554279686174> | Disconnected from **${channel.name}** due to inactivity`);
        }, 120000);
    }
    //prevent dc if new user(s) join the channel while bot is preparing to leave
    else if (servers[guild.id].dcTimeOut && channel.members.size != 1) {
        clearTimeout(servers[guild.id].dcTimeOut);  
    }
})

client.on('messageCreate', async (message) => {   
    //trigger reply on specific keywords
    const triggeredWord1 = new RegExp('why');
    if (message.content.toLowerCase().match(triggeredWord1)) {
        await message.channel.send(`<:doctor:1056617415179505706> Because fuck you <@${message.member.user.id}>`);
    }
    //react on author(me) getting pinged
    const userRegex1 = new RegExp(`<@!?${"287897575699382272"}>`);
    const userRegex2 = new RegExp(`<@!?${"852730444198051840"}>`);
    if (message.content.match(userRegex1) && !message.author.bot) {
        await message.channel.send("Miep 1");
    }
    else if (message.content.match(userRegex2) && !message.author.bot) {
        await message.channel.send("Miep 2");
    }


    /*UTILS NOT LIMITED BY COMMANDS*/
    //log dms
    //logDM.execute(client, message);

    //start a convo on textChannel obtained from command 'convo'
    if (textChannel && invokingMember === message.author) {
        if (!message) return textChannel.send("Not a message");
        if (message.content != `${prefix}endconvo`) {
            setTimeout(async () => {
                await textChannel.send(message.content);
            }, 300)
        }
    }

    //message does not start with prefix or is sent by bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    //messageArray
    const messageArray = message.content.slice(prefix.length).split(' ');

    //command
    const command = messageArray.shift().toLowerCase();

    //content
    const content = messageArray.slice();

    //create server queue 
    if (!servers[message.guild.id]) {
        servers[message.guild.id] = { 
            queue: [], //song queue
            player: null, //player for current song
            playerActive: false, //active when queue is not empty 
            repeatTrack: false,
            repeatQueue: false,
            skipped: false,
            currentTimeStampInterval: null,
            lastPlayMessage: null, //store last m>p message
            guild: message.guild,
            dcTimeOut: null, //timer that determines whether bot leaves or stays
        };
    }
    let server = servers[message.guild.id];
    
    /*COMMANDS*/
    switch (command) {  
        //start a conversation on specific channel
        case 'startconvo':
            channelName = content.shift();
            //get member that invokes this command
            invokingMember = message.author;
            //connect to text channel
            textChannel = await textConn.execute(client, channelName);
            await message.channel.send(`Conversation started on **${textChannel.name}**!`);
            //disconnect from textChannel after 5 min
            setTimeout(async () => {
                if (textChannel && invokingMember) {
                    textChannel = null;
                    invokingMember = null;
                    await message.channel.send(`Your session has expired`);
                }
            }, 300000)
            break;
        
        //end conversation on current channel (no module required)
        case 'endconvo':
            if (!textChannel && !invokingMember) return message.channel.send("There is no conversation taking place at the moment");
            textChannel = null;
            invokingMember = null;
            message.channel.send("Conversation has ended!");
            break;
            
        //message specific channel
        case 'message':
        case 'msg':
            //channel to send message
            channelName = content.shift(); //content is modified 
            msg.execute(client, channelName, message, content);
            break;

        //message specific channel with embed
        case 'embed': 
            //channel to send message
            channelName = content.shift(); //content is modified 
            msgEmbed.execute(client, channelName, message, content);
            break;

        case 'image':
        case 'img':
            //channel to send image
            channelName = content.shift(); //content is modified 
            img.execute(client, channelName, message, content);
            break;
        
        //dm specific user
        case 'dm':
            content.shift(); //remove user from content
            DM.execute(client, message, content);
            break;

        //display user avatar
        case 'avatar':
            targetUsername = content.slice(); //every word after command 
            userAvatar.execute(client, targetUsername, message);
            break;
        
        //commands
        case 'help':
            help.execute(client, message, content[0]);
            break;
   
        //clear messages    
        case 'purge': 
            purge.execute(client, message, parseInt(content[0]));
            break;

        //leave voice channel
        case 'leave':  
            voiceConn.leave(client, message, server);
            break;
        
        //play music
        case 'play':  
        case 'p':
            if (content.length === 0) return message.channel.send("Play what?");

            //store to lastPlayMessage
            server.lastPlayMessage = message;
  
            let err = null;
            //play by track url
            if (content[0].startsWith('https')) {
                err = await playTrack.execute(client, message, server, {
                    title: '', 
                    url: content[0], 
                    duration: '', 
                    paused: false,
                    timeStamp: 0,
                });

                //handle error while queuing
                if (err != 'none') {
                    console.log("New error detected: " + err);
                    return;
                } 
            }
            //play by track name
            else {
                err = await playTrack.execute(client, message, server, {
                    title: content.toString(), 
                    url: '', 
                    duration:'', 
                    paused: false, 
                    timeStamp: 0,
                })

                if (err != 'none') {
                    console.log("New error detected: " + err);
                    return;
                }
            }
            break;

        //view queue
        case 'queue':  
            viewQueue.execute(message, server.queue);
            break;
        
        //repeat track
        case 'looptrack': 
            loopTrack.execute(message, server);
            break;

        //repeat queue
        case 'loopqueue':
            loopQueue.execute(message, server);
            break;
        
        //skip track
        case 'skip':
            skipTrack.execute(message, server);
            break;

        //remove track
        case 'remove':
            if (content.length === 0) return message.channel.send("Remove what?");
            removeTrack.execute(message, server, content[0]);
            break;
        
        //now playing
        case 'nowplaying':
        case 'np':
            nowPlaying.execute(message, server);
            break;

        //clear queue
        case 'clear':
            await clearQueue.execute(message, server);
            break;

        //pause track
        case 'pause':
            pauseTrack.execute(message, server);
            break;

        case 'resume':
            resumeTrack.execute(message, server);
            break;

        case 'live':
            const stream =  await getStream(content[0].toString());
            if (stream.data.length != 0) {
                const streamer = await getStreamer(content[0].toString());
                let channel = client.channels.cache.find(channel => channel.id === '473481852229910540');  
                let embed = new EmbedBuilder()
                    .setAuthor({name: streamer.data[0].display_name})
                    .setTitle(stream.data[0].title)
                    .setURL(`https://www.twitch.tv/${streamer.data[0].login}`)
                    .setThumbnail(streamer.data[0].profile_image_url)
                    .setDescription(streamer.data[0].description)
                    .addFields(
                        {
                            name: 'Concurrent viewers',
                            value: `${stream.data[0].viewer_count}`,
                            inline: true,
                        },
                        {
                            name: 'Total views',
                            value: `${streamer.data[0].view_count}`,
                            inline: true,
                        }
                    )
                    .setFooter({text: `Streaming ${stream.data[0].game_name}`})

                if (streamer.data[0].display_name === 'Thebausffs') {
                    embed.setImage("https://cdn.discordapp.com/attachments/931874784109793290/1065690914242166845/image.png")
                }
                else if (streamer.data[0].display_name === 'RXSEZZ') {
                    embed.setImage("https://cdn.discordapp.com/attachments/931874784109793290/1065692673224233050/image.png")
                }
                channel.send({content: `@everynya, **Man I love ${streamer.data[0].display_name}, she is live on Twitch btw come jerk off to her voice**`, embeds: [embed]});
            }
            break;

    }
})

client.on('interactionCreate', async (interaction) => {   
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} 
    catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})


client.login(TOKEN);




//FUNCTIONS
//get twitch stream
async function getStream(twitchName) {
    const stream = await twitch.getStreams({channel: twitchName});
    return stream;
}

//get streamer
async function getStreamer(twitchName) {
    const streamer = await twitch.getUsers(twitchName);
    return streamer; 
}



