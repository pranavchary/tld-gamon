if (!process.env.NODE_ENV) require('dotenv').config();
const { TLD_GUILD_ID } = process.env;
const { MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { calculateTheWarWithinData } = require('../tww-current/commands');
const { SAY_QUOTES, SHOUT_QUOTES, BUTT_QUOTES, KEY_LEVEL_TOO_HIGH_QUOTES, SHOUT_QUOTES_TLD } = require('../constants');
const { MAX_KEY_LEVEL_AVAILABLE } = require('../tww-current/helpers');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gamon')
    .setDescription('Find the dungeons you need to improve your mythic rating!')
    .addSubcommand((sc) => sc.setName('help').setDescription('Learn what Gamon can do for you'))
    .addSubcommand((sc) => sc.setName('craft').setDescription('Quickly find one of Tyrianth\'s characters to fill your crafting orders'))
    .addSubcommand((sc) =>
        sc.setName('simulate')
        .setDescription('Simulate running all keys at a given keystone level')
        .addStringOption((opt) => opt.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true).setMinLength(2).setMaxLength(12))
        .addNumberOption((opt) => opt.setName('level').setDescription('Keystone level to simulate running all dungeons at').setRequired(true).setMinValue(2))
        .addStringOption((opt) => opt.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addBooleanOption((opt) => opt.setName('alphabetical').setDescription('Whether to sort dungeons alphabetically or not'))
    )
    .addSubcommand((sc) =>
        sc.setName('push')
        .setDescription('Find which dungeons you can complete with relative ease with to gain some Mythic+ rating')
        .addStringOption((opt) => opt.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true).setMinLength(2).setMaxLength(12))
        .addStringOption((opt) => opt.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addBooleanOption((opt) => opt.setName('alphabetical').setDescription('Whether to sort dungeons alphabetically or not'))
    )
    .addSubcommand((sc) =>
        sc.setName('goal')
        .setDescription('Learn how you could reach a goal rating (assumes all runs increase key level by 1)')
        .addStringOption((opt) => opt.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true).setMinLength(2).setMaxLength(12))
        .addNumberOption((opt) => opt.setName('rating').setDescription('The Mythic+ rating you would like to reach').setRequired(true).setMinValue(1))
        .addStringOption((opt) => opt.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addStringOption((opt) => opt.setName('sort').setDescription('How you want to sort the list of dungeons').addChoices(
            { name: 'alphabetical', value: 'alphabetical' },
            { name: 'level', value: 'level' },
        ))
    )
    .addSubcommand((sc) => sc.setName('says').setDescription('The Hero of Orgrimmar will whisper sweet nothings into your ear'))
    .addSubcommand((sc) => sc.setName('shouts').setDescription('Inspire the entire channel with a rallying cry! But we all know which quote you\'re looking for...'))
    .addSubcommand((sc) => sc.setName('butts').setDescription('Do it... I dare you...')),
    async execute(interaction) {
        const server = interaction.guildId;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'help') {
            const content = '### *I, Gamon, will save us!*\n\nGamon can provide information about completing Mythic+ dungeons at specific keystone levels (up to level 20) and how that might impact a character\'s Mythic+ rating.\n'
                + '- `/gamon craft` will help you find which of Tyrianth\'s characters to place crafting orders with :new:\n'
                + '- `/gamon simulate` will simulate a character running all Mythic+ dungeons at a single keystone level\n'
                + '- `/gamon push` will tell which dungeons a character could run to slightly improve their Mythic+ rating\n'
                + '- `/gamon goal` will provide a plan for dungeons a character can complete to reach a goal Mythic+ rating\n'
                + '- `/gamon says` will treat you to a nice quote from everyone\'s favorite Tauren (just between the two of you)\n'
                + '- `/gamon shouts` will inspire everyone in the channel with an epic shout from Gamon himself!\n'
                + '- `/gamon butts` will... never mind, just try it for yourself and see\n\n'
                + 'Required information for each command is taken via guided inputs to make it clear exactly what information is necessary.\n\n'
                + '*For any questions or issues with this bot, please DM Pran or Tusk*';
            await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        } else if (subcommand === 'says') {
            const rand = Math.floor(Math.random() * SAY_QUOTES.length);
            const content = 'Gamon whispers: ' + SAY_QUOTES[rand];
            await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        } else if (subcommand === 'shouts') {
            const shoutQuotes = server === TLD_GUILD_ID ? SHOUT_QUOTES_TLD : SHOUT_QUOTES;
            const rand = Math.floor(Math.random() * shoutQuotes.length);
            const content = shoutQuotes[rand];
            await interaction.reply({ content });
        } else if (subcommand === 'butts') {
            const rand = Math.floor(Math.random() * BUTT_QUOTES.length);
            const content = BUTT_QUOTES[rand];
            await interaction.reply({ content });
        } else if (subcommand === 'simulate' && interaction.options.getNumber('level') > MAX_KEY_LEVEL_AVAILABLE) {
            const rand = Math.floor(Math.random() * KEY_LEVEL_TOO_HIGH_QUOTES.length);
            const content = KEY_LEVEL_TOO_HIGH_QUOTES[rand];
            await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        } else if (subcommand !== 'craft') {
            try {
                await calculateTheWarWithinData(interaction);
            } catch (e) {
                console.error(e);
                await interaction.reply({
                    content: 'An error occurred while fetching your results. This could be an issue with Raider.io or with Discord itself. Please DM Pran or Tusk what you were trying to do when this happened, or try again in a few moments.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
