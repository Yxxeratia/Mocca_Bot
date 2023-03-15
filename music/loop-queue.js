module.exports = {
    name: 'loopQueue',
    execute: (message, server) => {
        if (!server.repeatQueue) {
            server.repeatQueue = true;
            message.channel.send("Loop is enabled for the current queue");
        }
        else {
            server.repeatQueue = false;
            message.channel.send("Loop is disabled for the current queue");
        }
    }
}