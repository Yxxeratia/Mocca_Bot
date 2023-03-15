module.exports = {
    name: 'resumeTrack',
    execute: (message, server) => {
        if (server.queue.length === 0) return message.channel.send("Queue is empty");

        if (server.queue[0].paused) {
            //resume the paused track
            server.player.unpause();
            server.queue[0].paused = false;
            message.channel.send("Track is resumed");
        }
        else {
            message.channel.send("Track is still playing");
        }
    }
}