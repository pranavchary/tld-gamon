const { SlashCommandBuilder } = require('@discordjs/builders');
const { calculateTheWarWithinData } = require('../tww-current/commands');
const { SAY_QUOTES, SHOUT_QUOTES } = require('../constants');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gamon')
    .setDescription('Find the dungeons you need to improve your mythic rating!')
    .addSubcommand((subcommand) => subcommand.setName('help').setDescription('Learn what Gamon can do for you'))
    .addSubcommand((subcommand) =>
        subcommand.setName('simulate')
        .setDescription('Simulate running all keys at a given keystone level')
        .addStringOption((option) => option.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true).setMinLength(2).setMaxLength(12))
        .addNumberOption((option) => option.setName('level').setDescription('Keystone level to simulate running all dungeons at').setRequired(true).setMinValue(2))
        .addStringOption((option) => option.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addBooleanOption((option) => option.setName('alphabetical').setDescription('Whether to sort dungeons alphabetically or not'))
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('push')
        .setDescription('Quickly find which affix and key level to complete a dungeon with to gain Mythic+ rating')
        .addStringOption((option) => option.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true).setMinLength(2).setMaxLength(12))
        .addStringOption((option) => option.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addBooleanOption((option) => option.setName('alphabetical').setDescription('Whether to sort dungeons alphabetically or not'))
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('goal')
        .setDescription('Learn how you could reach a goal rating (assumes all runs increase key level by 1)')
        .addStringOption((option) => option.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true).setMinLength(2).setMaxLength(12))
        .addNumberOption((option) => option.setName('rating').setDescription('The Mythic+ rating you would like to reach').setRequired(true).setMinValue(1))
        .addStringOption((option) => option.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addStringOption((option) => option.setName('sort').setDescription('How you want to sort the list of dungeons').addChoices(
            { name: 'alphabetical', value: 'alphabetical' },
            { name: 'level', value: 'level' },
        ))
    )
    .addSubcommand((subcommand) => subcommand.setName('says').setDescription('The Hero of Orgrimmar will whisper sweet nothings into your ear'))
    .addSubcommand((subcommand) => subcommand.setName('shouts').setDescription('Inspire the entire channel with a rallying cry! But we all know which quote you\'re looking for...')),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'help') {
            const content = '**Gamon** can provide information about completing Mythic+ dungeons at certain keystone levels and how that might impact a character\'s Mythic+ rating.\n\n'
                + '- `/gamon simulate` will simulate a character running all Mythic+ dungeons at a single keystone level\n'
                + '- `/gamon push` will tell which dungeons a character could run to slightly improve their Mythic+ rating\n'
                + '- `/gamon goal` will provide a plan for dungeons a character can complete to reach a goal Mythic+ rating\n'
                + '- `/gamon says` will treat you to a nice quote from everyone\'s favorite Tauren (just between the two of you)\n'
                + '- `/gamon shouts` will inspire everyone in the channel with an epic shout from Gamon himself!\n\n'
                + 'Required information for each command is taken via guided inputs to make it clear exactly what information is necessary. This reduces confusion around how to provide information properly.\n'
                + '*For any questions or issues with this bot, please DM Pran or Tusk*';
            await interaction.reply({ content, ephemeral: true });
        } else if (subCommand === 'says') {
            const rand = Math.floor(Math.random() * SAY_QUOTES.length);
            const content = 'Gamon whispers: ' + SAY_QUOTES[rand];
            await interaction.reply({ content, ephemeral: true });
        } else if (subCommand === 'shouts') {
            const rand = Math.floor(Math.random() * SHOUT_QUOTES.length);
            const content = SHOUT_QUOTES[rand];
            await interaction.reply({ content });
        } else {
            try {
                await calculateTheWarWithinData(interaction);
            } catch (e) {
                console.error(e);
                await interaction.reply({
                    content: 'An error occurred while fetching your results. This could be an issue with Raider.io or with Discord itself. Please DM Pran or Tusk what you were trying to do when this happened, or try again in a few moments.',
                    ephemeral: true
                });
            }
        }
    }
};
