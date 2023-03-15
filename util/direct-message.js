module.exports = {
    name: 'Dm',
    execute: async (client, message, content) => {

        //get member mentioned (@) 
        const member = message.mentions.users.first();

        if (!member) return message.channel.send("No user found"); 

        if (content.length === 0) return message.channel.send("Please include a message to send");


        await client.users.send(member.id, content.join(' '));
        console.log(`Message is successfully sent to ${member.username}. Content: ${content.join(' ')}`);
    }
}