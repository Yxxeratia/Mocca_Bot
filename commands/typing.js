const { SlashCommandBuilder } = require("discord.js");

let typing;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('typing')
        .setDescription("Perma type")
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start typing')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop typing')
        ),

    execute: async (interaction) => {
        if (interaction.options.getSubcommand() === 'start') {
            await interaction.reply("ok");
            let count = 0;
            typing = setInterval(() => {ghostTyping(count++)}, 8000);
        }
        else if (interaction.options.getSubcommand() === 'stop' && typing) {
            await interaction.reply("Ok I'll stop :(");
            clearInterval(typing);
        }
    }
}

function ghostTyping(count) {
    fetch("https://discord.com/api/v9/channels/473481852229910540/typing", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,fr-FR;q=0.6,fr;q=0.5",
            "authorization": process.env.UTOKEN2,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
            "x-super-properties": process.env.XSUPER,
        },
    "referrer": "https://discord.com/channels/473481851592507417/473481852229910540",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
    });
    console.log(count);
}
