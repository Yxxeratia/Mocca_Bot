module.exports = {
    name: 'pauseTrack',
    execute: (message, server) => {
        if (server.queue.length === 0) return message.channel.send("Queue is empty");
        if (server.queue[0].paused) return message.channel.send("Track has already been paused");
         
        //pause the current track
        server.player.pause(true);
        server.queue[0].paused = true;
        message.channel.send("Track is paused");
    }
}