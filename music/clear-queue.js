const prefix = 'm>';

module.exports = {
    name: 'clearQueue',
    execute: async (message, server) => {
        let initLength = server.queue.length;
        if (server.queue.length === 0) {
            return message.channel.send("Queue is empty");
        }

        if (server.queue.length === 1) {
            return message.channel.send(`There is only 1 track left in the queue, it can be cleared using \`${prefix}skip\` instead`)
        }

        //clear every track except for the one playing 
        for (let i = 1; i < initLength; i++) {
            server.queue.pop();
        }
        //stop player
        //server.player.stop();

        (initLength-1 > 1) ? message.channel.send(`Removed **${initLength-1} tracks** from queue`): message.channel.send(`Removed **${initLength-1} track** from queue`);
    },

    //for disconnecting (clear all songs including the one playing when bot leaves)
    forceClear: async (message, server) => {
        let initLength = server.queue.length;

        //clear every track except for the one playing 
        for (let i = 0; i < initLength; i++) {
            server.queue.pop();
        }
        //stop player
        server.player.stop();
        (initLength > 1) ? message.channel.send(`Removed **${initLength} tracks** from queue`): message.channel.send(`Removed **${initLength} track** from queue`);
    }
}