const {EmbedBuilder} = require('discord.js');

const prefix = "m>";

module.exports = {
    name: 'commands',
    execute: (client, message, targetCommand) => {
        let embed = new EmbedBuilder()
        .setAuthor({name: client.user.tag, iconURL: "https://cdn.discordapp.com/attachments/334347907710976001/1040179924348186654/7689-catconfused.gif"}) 

        if (targetCommand) {
            switch (targetCommand) {
                /*MUSIC*/

                //clear queue
                case 'clear':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}clear`)
                            .setDescription("```Clear the current queue```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}clear\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //loop
                case 'loop':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}loop`)
                            .setDescription("```Enable/Disable repeat for the current track```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}loop\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;
                
                //now playing
                case 'nowplaying':
                case 'np':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}nowplaying`)
                            .setDescription("```Display the current track```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}nowplaying\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: `*${prefix}np*`,
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //pause
                case 'pause':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}pause`)
                            .setDescription("```Pause the current track```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}pause\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //play 
                case 'play':
                case 'p':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}play`)
                            .setDescription("```Queue and play track/playlist```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}play [track/playlist]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: `*${prefix}p*`,
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //view queue
                case 'queue':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}queue`)
                            .setDescription("```Show the current queue```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}queue\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //resume 
                case 'resume':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}resume`)
                            .setDescription("```Resume the current track```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}resume\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //skip 
                case 'skip':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}skip`)
                            .setDescription("```Skip the current track```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}skip\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                /*UTILS*/

                //show user avatar
                case 'avatar':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}avatar`)
                            .setDescription("```Show avatar of member in server```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}avatar [member]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //dm a user
                case 'dm':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}dm`)
                            .setDescription("```Send DMs to member in server```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}dm [member] [message]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //send embed 
                case 'embed':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}embed`)
                            .setDescription("```Send embed to channel (globally)```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}embed [channel] [message]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;
                
                //start a conversation 
                case 'startconvo':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}startconvo`)
                            .setDescription("```Start a conversation in a channel (globally) ```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}startconvo [channel]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;
                
                //end conversation
                case 'endconvo':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}endconvo`)
                            .setDescription("```End current conversation ```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}endconvo\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //send image 
                case 'image':
                case 'img':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}image`)
                            .setDescription("```Send image to channel (globally) ```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}image [channel] [image]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: `*${prefix}img*`,
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //send message
                case 'message':
                case 'msg':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}message`)
                            .setDescription("```Send message to channel (globally)```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}message [channel] [message]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: `*${prefix}msg*`,
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

                //purge
                case 'purge':
                    message.channel.send({
                        embeds: [
                            embed
                            .setTitle(`${prefix}purge`)
                            .setDescription("```Delete message(s) on current channel```")
                            .addFields(
                                {
                                    name: "**Usages**",
                                    value: `\`${prefix}purge [amount]\``,
                                    inline: true,
                                },

                                {
                                    name: "**Aliases**",
                                    value: "none",
                                    inline: true,
                                }
                            )
                        ]
                    })
                    break;

            }
        }

        else {
            message.channel.send({
                embeds: [
                    embed
                    .setTitle("Commands")
                    .setDescription(`Type \`${prefix}help [command]\` to view command in details`) //engraved \` \`
                    .addFields(
                        {
                            name: "Music", 
                            value: "\`clear\` \`loop\`\n \`nowplaying\` \`pause\`\n \`play\` \`queue\`\n \`resume\` \`skip\`", 
                            inline: true,
                        },
    
                        {
                            name: "Utilities", 
                            value: "\`avatar\` \`dm\`\n \`embed\` \`endconvo\`\n \`image\` \`message\`\n \`purge\` \`startconvo\`", 
                            inline: true,
                        },
                    )
                ]
            })
        }
    }
}