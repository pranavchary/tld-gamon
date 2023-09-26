if (!process.env.NODE_ENV) require('dotenv').config();
const { BOT_TOKEN } = process.env;
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Initialize Discord Bot
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
bot.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		bot.commands.set(command.data.name, command);
	} else {
		console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Execute when bot is ready to run
bot.on('ready', () => {
	console.info('TLD M+ Helper is up and running');
});

bot.on('error', (error) => {
	console.info('TLD M+ Helper encountered an error:', error.name, error.message);
	console.error(error.stack);
});

bot.on('disconnect', (...params) => {
	console.warn('TLD M+ Helper disconnected. See log below:');
	console.warn(params);
});

bot.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true });
		}
	}
});

bot.login(BOT_TOKEN);