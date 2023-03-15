const playTrack = require('./play-track');

let player = null;

module.exports = {
    name: 'skipTrack',
    execute: (message, server) => {
        if (server.queue.length === 0) return message.channel.send("Queue is empty");
        
        //track is paused => unpause
        if (server.queue[0].paused) {
            server.player.unpause();
            server.queue[0].paused = false;
        }
        //stop 
        server.player.stop();
        server.skipped = true;
        message.channel.send("Skipped the current track");          
    }
}