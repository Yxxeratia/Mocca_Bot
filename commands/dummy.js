const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('noballs')
        .setDescription("no balls"),

    execute: async (interaction) => {
        await interaction.reply("Roger, no balls");
    }
}