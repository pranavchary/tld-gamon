if (!process.env.NODE_ENV) require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { BOT_TOKEN, BOT_CLIENT_ID } = process.env;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module and deploy your commands
const rest = new REST().setToken(BOT_TOKEN);

(async () => {
	try {
		console.info(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(Routes.applicationCommands(BOT_CLIENT_ID), { body: commands });
		console.info(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();