const {EmbedBuilder} = require('discord.js');
const play = require('play-dl');
const progressbar = require('string-progressbar');

module.exports = {
    name: 'nowPlaying',
    execute: (message, server) => {
        if (server.queue.length === 0) return message.channel.send("Queue is empty");
        
        /*display in minutes:seconds*/
        let songDuration = toReadableTime(server.queue[0].duration); 
        let songTimeStamp = toReadableTime(server.queue[0].timeStamp);

        let total = 100;
        let current = (server.queue[0].timeStamp / server.queue[0].duration) * 100;
        //console.log(progressbar.splitBar(total, current)[0]);
        let nowPlaying = new EmbedBuilder()
            .setTitle(`<a:spinningRat:1037375211110158436> Now playing: `)
            .setDescription(`**[${server.queue[0].title}](${server.queue[0].url})**\n\nRequested by: ${message.author}`)
            .addFields(
                {
                    name: '\u200b', 
                    value: `${songTimeStamp}   ${progressbar.splitBar(total, current, 20)[0]}   ${songDuration}`
                },
            )

        message.channel.send({
            embeds: [
                nowPlaying
            ]})
    }
}

//display time in the form of m...mm:ss
function toReadableTime(givenTime) {
    let minutes = (Math.floor(givenTime / 60));
    let minutesString = minutes.toString();
    if (minutesString.length === 1) {
        minutesString = '0' + minutesString;
    }

    let seconds = (givenTime - minutes * 60);
    let secondsString = seconds.toString();
    if (secondsString.length === 1) {
        secondsString = '0' + secondsString;
    }

    return minutesString + ":" + secondsString;
}