const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'viewQueue',
    execute: async (message, queue) => {
        if (queue.length === 0) {
            return message.channel.send("Queue is empty");
        }
        /*CURRENTLY WORKING*/
        //if (trackPlaying)
        let currentPage = 0;
        //number of embeds = number of pages
        const embeds = generateQueueEmbed(queue);
        const queuedEmbed = await message.channel.send({
            content: `Current page: ${currentPage+1}/${embeds.length}`, 
            embeds: [embeds[currentPage]],
        });
        //await for bot to react before collector can collect user reactions
        await queuedEmbed.react('⬅️');
        await queuedEmbed.react('➡️');

        //reactions include left and right arrow and user viewing queue is the one performing interactions
        const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && message.author.id === user.id;
        const collector = queuedEmbed.createReactionCollector(filter);

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '➡️') {
                //if not at the end, go to next page
                if (currentPage < embeds.length-1) {
                    currentPage++;
                    queuedEmbed.edit({
                        content: `Current page: ${currentPage+1}/${embeds.length}`, 
                        embeds: [embeds[currentPage]]
                    });
                }
            }
            else if (reaction.emoji.name === '⬅️') {
                //if not on the first page, go back
                if (currentPage != 0) {
                    currentPage--;
                    queuedEmbed.edit({
                        content: `Current page: ${currentPage+1}/${embeds.length}`, 
                        embeds: [embeds[currentPage]]
                    }); 
                }
            } 
        });
    }
}

function generateQueueEmbed(queue) {
    const embeds = [];
    let cap = 10;
    for (let i = 0; i < queue.length; i += 10) {
        const current = queue.slice(i, cap);
        let j = i; 
        cap += 10;

        const info = current.map(track => `${++j}) [${track.title}](${track.url})`).join('\n\n');

        const embed = new EmbedBuilder()
            .setDescription(`**[Current Song: ${current[0].title}](${current[0].url})**\n\n${info}`);
        embeds.push(embed);
    }
    return embeds;
}