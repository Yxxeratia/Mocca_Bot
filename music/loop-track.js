module.exports = {
    name: 'loopTrack',
    execute: (message, server) => {
        if (!server.repeatTrack) {
            server.repeatTrack = true;
            message.channel.send("Loop is enabled for the current track");
        }
        else {
            server.repeatTrack = false;
            message.channel.send("Loop is disabled for the current track");
        }
    }
}