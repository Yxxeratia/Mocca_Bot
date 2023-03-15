
//clear messages


module.exports = {
    name: 'purge',
    description: "Clear messages",
    execute: async (client, message, amount) => {
        if (!message.member.roles.cache.some(role => (role.name === `Miếp` || role.name === 'Weeb'))) {
            await message.channel.send("You lack the permissions to perform this action");
        }

        else if (!amount) {
            await message.channel.send("Please enter amount of messages to clear")
            .then((sent) => {
                setTimeout(() => {
                    sent.delete();
                }, 2500);
            });
        }

        else if (amount < 0 || amount >= 100) {
            await message.channel.send("Please enter a valid number")
            .then((sent) => {
                setTimeout(() => {
                    sent.delete();
                }, 2500);
            });
        }

        else {
            message.channel.bulkDelete(amount+1, true)
            .then(async (_message) => {
                await message.channel.send(`Bot cleared \`${_message.size-1}\` messages :broom:`)
                .then((sent) => {
                    setTimeout(() => {
                        sent.delete();
                    }, 1000);
                });
            });
        }
    }
}