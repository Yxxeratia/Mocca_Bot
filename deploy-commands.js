const {REST, Routes} = require('discord.js');
const fs = require('fs');

//login token
require('dotenv').config();
const TOKEN = process.env.ACCESS_TOKEN;
//bot id
const CLIENT_ID = process.env.CLIENT_ID;
//guild id
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
//grab all command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

//init rest api with bot's token
const rest = new REST({version: '10'}).setToken(TOKEN);

//deploy commands
async function main() {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        //register commands
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), 
            { body: commands }, 
        )
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch(err) {
        console.log(err);
    }
}
//run main  
main();