const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balls')
        .setDescription("balls"),

    execute: async (interaction) => {
        await interaction.reply("Roger, balls");
    }
}