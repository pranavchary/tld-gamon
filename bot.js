if (!process.env.NODE_ENV) require("dotenv").config();

const { BOT_TOKEN } = process.env;
const fs = require("node:fs");
const path = require("node:path");
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
} = require("discord.js");

// Initialize Discord Bot
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
bot.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	// eslint-disable-next-line import/no-dynamic-require
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ("data" in command && "execute" in command) {
		bot.commands.set(command.data.name, command);
	} else {
		console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Execute when bot is ready to run
bot.on("ready", () => {
	console.info("[READY] I, Gamon, will save us!");
});

// Execute when bot encounters an error
bot.on("error", (error) => {
	console.info("[ERROR] I will not fall again!");
	console.error(error.stack);
});

// Execute when bot disconnects for any reason once live
bot.on("disconnect", (...params) => {
	console.warn("[DISCONNECT] It cannot end... like... this...");
	console.warn(params);
});

// Chat command interaction handler
bot.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
		return;
	}

	// Crafting orders retired. Guard stale `/gamon craft` invocations (in case command deployment doesn't work as intended).
	if (interaction.options.getSubcommand() === "craft") {
		await interaction.reply({
			content: "Gamon no longer takes crafting orders, friend. Reach out to Magni instead.",
			flags: MessageFlags.Ephemeral,
		});
	} else {
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: "I, Gamon, am confused as to what just happened...", flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: "I, Gamon, could not execute this command", flags: MessageFlags.Ephemeral });
			}
		}
	}
});

bot.login(BOT_TOKEN);
