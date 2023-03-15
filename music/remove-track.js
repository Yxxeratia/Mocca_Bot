const prefix = 'm>';

module.exports = {
    name: 'removeTrack',
    execute: (message, server, position) => {
        if (server.queue.length === 0) return message.channel.send("Queue is empty");
            
        if (parseInt(position) <= 0 || parseInt(position) > server.queue.length || !isNumeric(position)) return message.channel.send("Not a valid postion");
            
        if (parseInt(position) === 1) return message.channel.send(`Track is currently playing, use \`${prefix}skip\` instead`);
            
        message.channel.send(`Removed **${server.queue[position-1].title}** from **position ${position}** of the queue`);
        server.queue.splice(position-1, 1);
        
    }
}


function isNumeric(value) {
    return /^-?\d+$/.test(value);
}