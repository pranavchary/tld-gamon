if (!process.env.NODE_ENV) require('dotenv').config();
const { BOT_TOKEN, QUEST_IMPORTANT_ID, CRAFTING_DM_USER_ID, TLD_GUILD_ID } = process.env;
const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

const {
	CATEGORY_OPTIONS,
	PROFESSION_OPTIONS,
	CRAFTING_MAP
} = require('./tww-current/profession-constants');
// const { initializeCache } = require('./cache-service');

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

// Initialize data cache
// initializeCache();

const craftSelectionMap = new Map();
const getCraftingInstructions = (isTLDServer, appendedText) => {
	let craftingInstructions = `
	### :warning: This bot DOES NOT submit a crafting order automatically for you in WoW.
	### :warning: Crafting orders confirmed in Discord WILL NOT be fulfilled if you have not submitted it in WoW.	
	`;

	if (isTLDServer) {
		craftingInstructions = craftingInstructions.replace(/(:warning:)/gi, `<:quest_important:${QUEST_IMPORTANT_ID}>`);
	}

	craftingInstructions += `

	### __How to Use__
	1. Fill out the dropdown fields until you find the item you want crafted.
	2. Copy your crafter's name from Discord and use it to place your crafting order in-game.
	3. Click the **Confirm** button to notify Tyrianth that you've submitted a crafting order for him.
	`;

	return appendedText ? craftingInstructions + appendedText : craftingInstructions;
};

// Execute when bot is ready to run
bot.on('ready', () => {
	console.info('[READY] I, Gamon, will save us!');
});

// Execute when bot encounters an error
bot.on('error', (error) => {
	console.info('[ERROR] I will not fall again!');
	console.error(error.stack);
});

// Execute when bot disconnects for any reason once live
bot.on('disconnect', (...params) => {
	console.warn('[DISCONNECT] It cannot end... like... this...');
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

	// Crafting Interaction: Select Category
	if (interaction.options.getSubcommand() === 'craft') {
		const categories = new StringSelectMenuBuilder()
			.setCustomId('category')
			.setPlaceholder('What kind of item are you looking for?')
			.addOptions(CATEGORY_OPTIONS);
		const categoryRow = new ActionRowBuilder().addComponents(categories);

		await interaction.reply({ content: getCraftingInstructions(interaction.guildId === TLD_GUILD_ID), components: [categoryRow], flags: MessageFlags.Ephemeral });
	} else {
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'I, Gamon, am confused as to what just happened...', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'I, Gamon, could not execute this command', flags: MessageFlags.Ephemeral });
			}
		}
	}

});

// Crafting Interaction: Select Profession
bot.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;

	if (interaction.customId === 'category') {
		const category = interaction.values[0];
		craftSelectionMap.set(interaction.user.id, { category });
		
		const categoryRow = new ActionRowBuilder().addComponents(StringSelectMenuBuilder
			.from(interaction.message.components[0].components[0])
			.setOptions(interaction.message.components[0].components[0].options.map((opt) => ({ ...opt, default: opt.value === category })))
		);

		const availableProfs = Object.entries(CRAFTING_MAP).filter(([, cats]) => Object.keys(cats).includes(category)).map(([prof]) => prof);
		const professions = new StringSelectMenuBuilder()
			.setCustomId('profession')
			.setPlaceholder('Which profession can craft the item you want?')
			.addOptions(PROFESSION_OPTIONS.filter((prof) => availableProfs.includes(prof.value)));
		const professionRow = new ActionRowBuilder().addComponents(professions);
		
		await interaction.update({ content: getCraftingInstructions(interaction.guildId === TLD_GUILD_ID), components: [categoryRow, professionRow] });
	}
});

// Crafting Interaction: Select Item
bot.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isStringSelectMenu() || interaction.customId !== 'profession') return;

	const category = craftSelectionMap.get(interaction.user.id).category;
	const profession = interaction.values[0];
	craftSelectionMap.set(interaction.user.id, { category, profession });
	
	const categoryRow = new ActionRowBuilder().addComponents(StringSelectMenuBuilder
		.from(interaction.message.components[0].components[0])
		.setOptions(interaction.message.components[0].components[0].options.map((opt) => ({ ...opt, default: opt.value === category })))
	);
	const professionRow = new ActionRowBuilder().addComponents(StringSelectMenuBuilder
		.from(interaction.message.components[1].components[0])
		.setOptions(interaction.message.components[1].components[0].options.map((opt) => ({ ...opt, default: opt.value === profession })))
	);

	const crafts = new StringSelectMenuBuilder()
		.setCustomId('item-search')
		.setPlaceholder('Which of these items would you like?')
		.addOptions(Object.values(CRAFTING_MAP[profession][category]).flatMap((item) => item).map((item) => ({ label: item, value: item })));
	const craftsRow = new ActionRowBuilder().addComponents(crafts);

	await interaction.update({ content: getCraftingInstructions(interaction.guildId === TLD_GUILD_ID), components: [categoryRow, professionRow, craftsRow] });
});

// Crafting Interaction: Confirm with DM
bot.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isStringSelectMenu() || interaction.customId !== 'item-search') return;

	const category = craftSelectionMap.get(interaction.user.id).category;
	const profession = craftSelectionMap.get(interaction.user.id).profession;
	const item = interaction.values[0];
	let crafter;
	for (let toon in CRAFTING_MAP[profession][category]) {
		if (CRAFTING_MAP[profession][category][toon].includes(item)) {
			crafter = toon;
			break;
		}
	}

	if (!crafter) {
		craftSelectionMap.delete(interaction.user.id);
		await interaction.reply({ content: 'Gamon was not able to find you a suitable crafter... My humblest apologies.', flags: MessageFlags.Ephemeral });
		return;
	}

	craftSelectionMap.set(interaction.user.id, { category, profession, item, crafter });
	
	const categoryRow = new ActionRowBuilder().addComponents(StringSelectMenuBuilder
		.from(interaction.message.components[0].components[0])
		.setOptions(interaction.message.components[0].components[0].options.map((opt) => ({ ...opt, default: opt.value === category })))
	);
	const professionRow = new ActionRowBuilder().addComponents(StringSelectMenuBuilder
		.from(interaction.message.components[1].components[0])
		.setOptions(interaction.message.components[1].components[0].options.map((opt) => ({ ...opt, default: opt.value === profession })))
	);
	const craftsRow = new ActionRowBuilder().addComponents(StringSelectMenuBuilder
		.from(interaction.message.components[2].components[0])
		.setOptions(interaction.message.components[2].components[0].options.map((opt) => ({ ...opt, default: opt.value === item })))
	);

	const craftingInstructionsAddon = `\n:clipboard: **Your Crafter:** *${crafter}*`;

	const infoButton = new ButtonBuilder()
		.setCustomId('craft-info')
		.setLabel('Only confirm AFTER placing crafting order in-game')
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(true);
	
	const confirmButton = new ButtonBuilder()
		.setCustomId('craft-confirm')
		.setLabel('Confirm')
		.setStyle(ButtonStyle.Success);
	
	const confirmRow = new ActionRowBuilder().addComponents(infoButton, confirmButton);

	await interaction.update({ content: getCraftingInstructions(interaction.guildId === TLD_GUILD_ID, craftingInstructionsAddon), components: [categoryRow, professionRow, craftsRow, confirmRow] });
});

bot.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isButton() || interaction.customId !== 'craft-confirm') return;
	const {
		item,
		crafter
	} = craftSelectionMap.get(interaction.user.id);
	
	try {
		const userToMessage = await bot.users.fetch(CRAFTING_DM_USER_ID);
		const message = `
		### :bell: New Crafting Request
		**Requested By:** <@${interaction.user.id}>
		**Item:** ${item}
		--------------
		Log in to **${crafter}** to fulfil this request.
		`;
		await userToMessage.send(message);

		const completionMessage = `:white_check_mark: Gamon has relayed your request for **${item}** to Tyrianth. Await your item's arrival patiently, friend.`;
		await interaction.update({ content: completionMessage, components: [] });
	} catch (error) {
		console.error(error);
	}
});

bot.login(BOT_TOKEN);
