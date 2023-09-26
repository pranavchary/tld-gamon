const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const {
    getAffixCountByKeyLevel,
    getDungeonScore,
    dungeonShortnameMap
} = require('../helpers');

const cleanMythicPlusData = (rioData, keyLevel) => {
    const { mythic_plus_best_runs: bestRuns, mythic_plus_alternate_runs: altRuns, ...cleanData } = rioData;
    const dungeonShortNames = Object.keys(dungeonShortnameMap);

    const bestToAdd = dungeonShortNames.filter((d) => !bestRuns.map((r) => r.short_name).includes(d));
    const altToAdd = dungeonShortNames.filter((d) => !altRuns.map((r) => r.short_name).includes(d));

    for (let i = 0; i < bestToAdd.length; i++) {
        const dungeon = {
            mythic_level: keyLevel,
            score: 0,
            dungeon: dungeonShortnameMap[bestToAdd[i]],
            short_name: bestToAdd[i],
            affixes: [{ name: 'Fortified' }]
        }

        bestRuns.push(dungeon);
    }

    for (let i = 0; i < altToAdd.length; i++) {
        const dungeon = {
            mythic_level: keyLevel,
            score: 0,
            dungeon: dungeonShortnameMap[altToAdd[i]],
            short_name: altToAdd[i],
            affixes: [{ name: 'Tyrannical' }]
        }

        const bestVersion = bestRuns.find((r) => r.short_name === dungeon.short_name);
        if (bestVersion && bestVersion.affixes[0].name === 'Tyrannical') {
            dungeon.affixes[0].name = 'Fortified';
        }

        altRuns.push(dungeon);
    }

    cleanData.mythic_plus_best_runs = bestRuns;
    cleanData.mythic_plus_alternate_runs = altRuns;

    return cleanData;
}

const simulateLevel = (rioData, keyLevel) => {
    const data = cleanMythicPlusData(rioData);

    let totalScore = 0;
    const { mythic_plus_best_runs, mythic_plus_alternate_runs } = data;
    const fortified = [];
    const tyrannical = [];

    for (let bestRun of mythic_plus_best_runs) {
        const dungeon = {
            name: dungeonShortnameMap[bestRun.short_name],
            shortName: bestRun.short_name,
            primaryAffix: bestRun.affixes[0].name,
        };

        const affixCount = getAffixCountByKeyLevel(keyLevel);
        const simmedScore = getDungeonScore(keyLevel, affixCount, keyLevel > 10);
        const score = +(bestRun.score * 1.5).toFixed(1);

        if (score > simmedScore) {
            dungeon.potentialIncrease = 0;
            dungeon.score = score;
            dungeon.level = bestRun.mythic_level;
        } else {
            dungeon.potentialIncrease = Math.ceil(simmedScore - score);
            dungeon.score = simmedScore;
            dungeon.level = keyLevel;
        }

        if (dungeon.primaryAffix.toLowerCase() === 'fortified') {
            fortified.push(dungeon);
        } else {
            tyrannical.push(dungeon);
        }

        totalScore += dungeon.score;
    }

    for (let altRun of mythic_plus_alternate_runs) {
        const dungeon = {
            name: dungeonShortnameMap[altRun.short_name],
            shortName: altRun.short_name,
            primaryAffix: altRun.affixes[0].name,
        };

        const affixCount = getAffixCountByKeyLevel(keyLevel);
        const simmedScore = +(getDungeonScore(keyLevel, affixCount, keyLevel > 10) / 3).toFixed(1);
        const score = +(altRun.score * 0.5).toFixed(1);

        if (score > simmedScore) {
            dungeon.potentialIncrease = 0;
            dungeon.score = score;
            dungeon.level = altRun.mythic_level;
        } else {
            dungeon.potentialIncrease = Math.ceil(simmedScore - score);
            dungeon.score = simmedScore;
            dungeon.level = keyLevel;
        }

        if (dungeon.primaryAffix.toLowerCase() === 'fortified') {
            fortified.push(dungeon);
        } else {
            tyrannical.push(dungeon);
        }

        totalScore += dungeon.score;
    }
    
    totalScore = Math.ceil(totalScore);
    return { tyrannical, fortified, totalScore }
}

const getPushData = (rioData) => {
    const { mythic_plus_best_runs, mythic_plus_alternate_runs } = rioData;
    const push = getBlankPushObject();

    for (let run of mythic_plus_best_runs) {
        run.isBestRun = true;
        push[run.short_name][run.affixes[0].name.toLowerCase()] = run;
    }
    for (let run of mythic_plus_alternate_runs) {
        run.isBestRun = false;
        push[run.short_name][run.affixes[0].name.toLowerCase()] = run;
    }

    let totalScore = 0;
    let totalPotentialIncrease = 0;
    const dungeons = [];

    for (let shortName of Object.keys(push)) {
        const pushDungeon = push[shortName];
        const dungeon = {
            name: dungeonShortnameMap[shortName],
            shortName: shortName,
        };
        if (!pushDungeon.fortified.score && !pushDungeon.tyrannical.score) {
            // Use a base score calc for a +2 Fortified dungeon

            dungeon.primaryAffix = 'Fortified';
            dungeon.potentialIncrease = getDungeonScore(2, 1);
            dungeon.score = 0;
            dungeon.level = 2

            totalScore += dungeon.score
            totalPotentialIncrease += Math.ceil(dungeon.potentialIncrease);

            dungeons.push(dungeon);
            continue;
        }
        
        let targetAffix = 'fortified';
        let bestAffix = 'tyrannical'
        if (pushDungeon.fortified.isBestRun) {
            targetAffix = bestAffix;
            bestAffix = 'fortified';
        }
        dungeon.primaryAffix = targetAffix.charAt(0).toUpperCase() + targetAffix.substring(1);
        let altScore = 0;
        const bestScore = +(pushDungeon[bestAffix].score * 1.5).toFixed(1);
        if (pushDungeon[targetAffix].score) altScore = +(pushDungeon[targetAffix].score / 2).toFixed(1);

        dungeon.potentialIncrease = +((bestScore / 3) - altScore).toFixed(1);
        dungeon.score = +(bestScore + altScore).toFixed(1);
        dungeon.level = pushDungeon[bestAffix].mythic_level - (pushDungeon[bestAffix].num_keystone_upgrades > 0 ? 0 : 1);;

        totalScore += dungeon.score
        totalPotentialIncrease += Math.ceil(dungeon.potentialIncrease);

        dungeons.push(dungeon);
    }

    totalScore = Math.ceil(totalScore);
    dungeons.forEach((d) => d.potentialIncrease = Math.ceil(d.potentialIncrease));

    return { dungeons, totalScore, totalPotentialIncrease };
}

const getGoalDungeonToRun = (dungeon, rioData, useRioUpgrades = false) => {
    const result = { ...dungeon };
    // Check how many key level upgrades a character got for their best run for the dungeon on this affix and increase the recommended key level by that much
    let bestRioDungeon = rioData.mythic_plus_best_runs.find((run) => run.short_name === dungeon.shortName && run.affixes[0].name === dungeon.primaryAffix)
        || rioData.mythic_plus_alternate_runs.find((run) => run.short_name === dungeon.shortName && run.affixes[0].name === dungeon.primaryAffix);
    result.level += useRioUpgrades ? (bestRioDungeon?.num_keystone_upgrades || 1) : 1;

    // We want to find the same dungeon's run information for the opposite affix. If it's not found, create an object for a brand new run
    let alt = rioData.mythic_plus_best_runs.find((run) => run.short_name === dungeon.shortName && run.affixes[0].name !== dungeon.primaryAffix)
        || rioData.mythic_plus_alternate_runs.find((run) => run.short_name === dungeon.shortName && run.affixes[0].name !== dungeon.primaryAffix);

    alt = convertRioDungeon(alt, 0);
    if (!alt) {
        alt = {
            name: dungeonShortnameMap[dungeon.shortName],
            shortName: dungeon.shortName,
            primaryAffix: dungeon.primaryAffix === 'Fortified' ? 'Tyrannical' : 'Fortified',
            potentialIncrease: getDungeonScore(2, 1),
            score: 0,
            level: 2,
        }
    }

    const newBestScore = +(getDungeonScore(result.level, getAffixCountByKeyLevel(result.level)) * 1.5).toFixed(1);
    const newAltScore = +(alt.score / 2).toFixed(1);

    result.potentialIncrease = Math.ceil((newBestScore / 3) - newAltScore);
    result.score = +(newBestScore + newAltScore).toFixed(1);

    return result;
}

const getGoalData = (pushData, rioData, goal) => {
    let { dungeons: dungeonsToRun } = pushData;
    let runningTotal = pushData.totalScore + pushData.totalPotentialIncrease;
    // Sort current list of push dungeons by lowest key level to highest
    dungeonsToRun = dungeonsToRun.sort((a, b) => a.level - b.level);
    // Iterate over each dungeon, calculate what the score and new score weights would be for timing the same dungeon on a higher key level,
    // add then add it to the list of recommended dungeons
    for (let d of dungeonsToRun) {
        const nextDungeon = getGoalDungeonToRun(d, rioData, true);
        dungeonsToRun.push(nextDungeon);
        runningTotal = Math.ceil(runningTotal + nextDungeon.potentialIncrease)
        if (runningTotal >= goal) {
            break;
        }
    }

    if (runningTotal < goal) {
        // If the goal rating still has not been met, sort recommended dungeon list by key level (descending) and begin increasing those key levels by one.
        // Repeat this process until the goal rating has been achieved
        do {
            let dungeonsSortedDesc = dungeonsToRun.sort((a, b) => b.level - a.level);
            for (let d of dungeonsSortedDesc) {
                const nextDungeon = getGoalDungeonToRun(d, rioData, true);
                dungeonsToRun.push(nextDungeon);
                runningTotal = Math.ceil(runningTotal + nextDungeon.potentialIncrease)
                if (runningTotal >= goal) {
                    break;
                }
            }
        } while (runningTotal < goal)
    }
    return { dungeons: dungeonsToRun, totalScore: runningTotal };
}

const getBlankPushObject = () => {
    const result = {};
    for (let shortName of Object.keys(dungeonShortnameMap)) {
        result[shortName] = { tyrannical: {}, fortified: {} };
    }

    return result;
}

const convertRioDungeon = (rioDungeon, potentialIncrease) => {
    if (!rioDungeon) return undefined;

    const { short_name: shortName, affixes: [{ name: primaryAffix }], mythic_level: level } = rioDungeon;
    return {
        name: dungeonShortnameMap[shortName],
        shortName,
        primaryAffix,
        potentialIncrease,
        score: getDungeonScore(level, getAffixCountByKeyLevel(level)),
        level
    };
}

const getSortedCleanedDungeons = (tyrannical, fortified, sortMethod = 'increase') => {
    let tyrannicalIncreases = [];
    let fortifiedIncreases = [];
    if (tyrannical && tyrannical.length > 0) {
        tyrannicalIncreases = tyrannical.filter((d) => d.potentialIncrease > 0);
        if (sortMethod === 'alphabetical') {
            tyrannicalIncreases = tyrannicalIncreases.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMethod === 'level') {
            tyrannicalIncreases = tyrannicalIncreases.sort((a, b) => a.level - b.level);
        } else {
            tyrannicalIncreases = tyrannicalIncreases.sort((a, b) => b.potentialIncrease - a.potentialIncrease);
        }
    }
    
    if (fortified && fortified.length > 0) {
        fortifiedIncreases = fortified.filter((d) => d.potentialIncrease > 0);
        if (sortMethod === 'alphabetical') {
            fortifiedIncreases = fortifiedIncreases.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMethod === 'level') {
            fortifiedIncreases = fortifiedIncreases.sort((a, b) => a.level - b.level);
        } else {
            fortifiedIncreases = fortifiedIncreases.sort((a, b) => b.potentialIncrease - a.potentialIncrease);
        }
    }
    
    return [...tyrannicalIncreases, ...fortifiedIncreases];
}

const requestRaiderIoData = async (args) => {
    try {
        return await axios.get('https://raider.io/api/v1/characters/profile', {
            params: {
                ...args,
                name: encodeURIComponent(args.name),
                region: 'us',
                fields: 'gear,mythic_plus_best_runs,mythic_plus_alternate_runs,mythic_plus_scores_by_season:current'
            }
        });
    } catch (e) {
        return e;
    }
    
}

const postEmbedMessage = (calcData, rioData, interaction) => {
    const {
        name,
        realm,
        profile_url,
        thumbnail_url,
        mythic_plus_scores_by_season: [{ scores : { all: currentScore } }]
    } = rioData;
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${name} - ${realm}`, url: profile_url })
        .setDescription(`Here's how your Mythic+ rating could increase by completing the following keys at **Mythic level ${interaction.options.getNumber('level')}** within the time limit:`)
        .setThumbnail(thumbnail_url)
        .addFields({ name: 'Current Mythic+ Rating', value: Math.floor(rioData.mythic_plus_scores_by_season[0].scores.all).toString() })
        .setFooter({ text: 'Click your character\'s name to view its Raider.io profile' });
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mr-helper')
    .setDescription('Find the dungeons you need to improve your mythic rating!')
    .addSubcommand((subcommand) => subcommand.setName('help').setDescription('Learn how this bot works'))
    .addSubcommand((subcommand) =>
        subcommand.setName('simulate')
        .setDescription('Simulate running all keys at a given keystone level')
        .addStringOption((option) => option.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true))
        .addNumberOption((option) => option.setName('level').setDescription('Keystone level to simulate running all dungeons at').setRequired(true))
        .addStringOption((option) => option.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addBooleanOption((option) => option.setName('alphabetical').setDescription('Whether to sort dungeons alphabetically or not'))
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('push')
        .setDescription('Quickly find which affix and key level to complete a dungeon with to gain Mythic+ rating')
        .addStringOption((option) => option.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true))
        .addStringOption((option) => option.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addBooleanOption((option) => option.setName('alphabetical').setDescription('Whether to sort dungeons alphabetically or not'))
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('goal')
        .setDescription('Learn how you could reach a goal rating (assumes all runs increase key level by 1)')
        .addStringOption((option) => option.setName('character').setDescription('Character to fetch Mythic+ data for').setRequired(true))
        .addNumberOption((option) => option.setName('rating').setDescription('The Mythic+ rating you would like to reach').setRequired(true))
        .addStringOption((option) => option.setName('realm').setDescription('Realm a character is on *(if one is not provided, this bot will search for characters on Thrall)*'))
        .addStringOption((option) => option.setName('sort').setDescription('How you want to sort the list of dungeons').addChoices(
            { name: 'alphabetical', value: 'alphabetical' },
            { name: 'level', value: 'level' },
        ))
    ),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'help') {
            await interaction.reply({ content: 'How to use this bot...', ephemeral: true });
        } else {
            try {
                const args = { realm: interaction.options.getString('realm'), name: interaction.options.getString('character') };
                if (!args.realm) args.realm = 'thrall';
                args.realm = args.realm.toLowerCase();
                const response = await requestRaiderIoData(args);
                if (response.response?.data?.error) {
                    await interaction.reply({ content: 'There was an error retrieving character data. Please try again later.', ephemeral: true });
                    return;
                }
                const { data } = response;
                if (subCommand === 'simulate') {
                    const simmedData = simulateLevel(data, interaction.options.getNumber('level'));
                    const sorted = getSortedCleanedDungeons(simmedData.tyrannical, simmedData.fortified, interaction.options.getBoolean('alphabetical') ? 'alphabetical' : 'level');
                    if (sorted.length === 0) {
                        await interaction.reply({
                            content: `${data.name} won't get any rating increase from keys at **Mythic level ${interaction.options.getNumber('level')}**. Try simulating a higher key level.`,
                            ephemeral: true
                        });
                        return;
                    }

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `${data.name} - ${data.realm}`, url: data.profile_url })
                        .setDescription(`Here's how your Mythic+ rating could increase by completing the following keys at **Mythic level ${interaction.options.getNumber('level')}** within the time limit:`)
                        .setThumbnail(data.thumbnail_url)
                        .addFields({ name: 'Current Mythic+ Rating', value: Math.floor(data.mythic_plus_scores_by_season[0].scores.all).toString() })
                        .setFooter({ text: 'Click your character\'s name to view its Raider.io profile' });

                    let tyranDungeons = '';
                    let tyranIncrease = 0;
                    let fortDungeons = '';
                    let fortIncrease = 0;
                    sorted.forEach((dungeon) => {
                        if (dungeon.primaryAffix === 'Tyrannical') {
                            tyranDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name}\n`;
                            tyranIncrease += dungeon.potentialIncrease;
                        } else {
                            fortDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name}\n`;
                            fortIncrease += dungeon.potentialIncrease;
                        }
                    });

                    if (tyranDungeons.length > 0) embed.addFields({ name: 'Tyrannical', value: tyranDungeons, inline: true });
                    if (fortDungeons.length > 0) embed.addFields({ name: 'Fortified', value: fortDungeons, inline: true });
                    if (tyranDungeons.length > 0 || fortDungeons.length > 0) {
                        embed.addFields({ name: ' ', value: ' ' });
                        if (tyranDungeons.length > 0) embed.addFields({ name: 'Simulated rating increase', value: tyranIncrease.toString(), inline: true });
                        if (fortDungeons.length > 0) embed.addFields({ name: 'Simulated rating increase', value: fortIncrease.toString(), inline: true });
                    }

                    embed.addFields(
                        { name: ' ', value: ' ' },
                        { name: ' ', value: `Simulated Mythic+ rating after completing these dungeons: **${simmedData.totalScore}**` }
                    );
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    const pushData = getPushData(data);
                    pushData.dungeons = getSortedCleanedDungeons(pushData.dungeons, undefined, interaction.options.getBoolean('alphabetical') ? 'alphabetical' : 'level');
                    if (pushData.dungeons.length === 0) {
                        await interaction.reply({ content: `Could not calculate data for ${data.name}. Please try again later.`, ephemeral: true });
                        return;
                    }
                    if (subCommand === 'push') {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: `${data.name} - ${data.realm}`, url: data.profile_url })
                            .setDescription('Here are some Mythic+ dungeons you could complete within the time limit to increase your rating:')
                            .setThumbnail(data.thumbnail_url)
                            .addFields({ name: 'Current Mythic+ Rating', value: Math.floor(data.mythic_plus_scores_by_season[0].scores.all).toString() })
                            .setFooter({ text: 'Click your character\'s name to view its Raider.io profile' });
                            
                        let tyranDungeons = '';
                        let tyranIncrease = 0;
                        let fortDungeons = '';
                        let fortIncrease = 0;
                        pushData.dungeons.forEach((dungeon) => {
                            if (dungeon.primaryAffix === 'Tyrannical') {
                                tyranDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name} (+${dungeon.level})\n`;
                                tyranIncrease += dungeon.potentialIncrease;
                            } else {
                                fortDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name} (+${dungeon.level})\n`;
                                fortIncrease += dungeon.potentialIncrease;
                            }
                        });
    
                        if (tyranDungeons.length > 0) embed.addFields({ name: 'Tyrannical', value: tyranDungeons, inline: true });
                        if (fortDungeons.length > 0) embed.addFields({ name: 'Fortified', value: fortDungeons, inline: true });
                        if (tyranDungeons.length > 0 || fortDungeons.length > 0) {
                            embed.addFields({ name: ' ', value: ' ' });
                            if (tyranDungeons.length > 0) embed.addFields({ name: 'Minimum rating increase', value: tyranIncrease.toString(), inline: true });
                            if (fortDungeons.length > 0) embed.addFields({ name: 'Minimum rating increase', value: fortIncrease.toString(), inline: true });
                        }
    
                        embed.addFields(
                            { name: ' ', value: ' ' },
                            { name: ' ', value: `Minimum Mythic+ rating after completing these dungeons: **${pushData.totalScore + pushData.totalPotentialIncrease}**` }
                        );
                        await interaction.reply({ embeds: [embed], ephemeral: true });
    
                    } else if (subCommand === 'goal') {
                        if (pushData.totalScore + pushData.totalPotentialIncrease >= interaction.options.getNumber('rating')) {
                            // Give the user their regular 'push' info
                            return;
                        } else {
                            const goalData = getGoalData(pushData, data, interaction.options.getNumber('rating'));
                            goalData.dungeons = getSortedCleanedDungeons(goalData.dungeons, undefined, interaction.options.getString('sort'));

                            const embed = new EmbedBuilder()
                                .setAuthor({ name: `${data.name} - ${data.realm}`, url: data.profile_url })
                                .setDescription(`Here is a way you could reach your goal Mythic+ rating of ${interaction.options.getNumber('rating')}:`)
                                .setThumbnail(data.thumbnail_url)
                                .addFields({ name: 'Current Mythic+ Rating', value: Math.floor(data.mythic_plus_scores_by_season[0].scores.all).toString() })
                                .setFooter({ text: 'Click your character\'s name to view its Raider.io profile' });
                            
                            let tyranDungeons = '';
                            let tyranIncrease = 0;
                            let fortDungeons = '';
                            let fortIncrease = 0;
                            goalData.dungeons.forEach((dungeon) => {
                                if (dungeon.primaryAffix === 'Tyrannical') {
                                    tyranDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name} (+${dungeon.level})\n`;
                                    tyranIncrease += dungeon.potentialIncrease;
                                } else {
                                    fortDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name} (+${dungeon.level})\n`;
                                    fortIncrease += dungeon.potentialIncrease;
                                }
                            });
                            
                            if (tyranDungeons.length > 0) embed.addFields({ name: 'Tyrannical', value: tyranDungeons, inline: true });
                            if (fortDungeons.length > 0) embed.addFields({ name: 'Fortified', value: fortDungeons, inline: true });
                            if (tyranDungeons.length > 0 || fortDungeons.length > 0) {
                                embed.addFields({ name: ' ', value: ' ' });
                                if (tyranDungeons.length > 0) embed.addFields({ name: 'Estimated rating increase', value: tyranIncrease.toString(), inline: true });
                                if (fortDungeons.length > 0) embed.addFields({ name: 'Estimated rating increase', value: fortIncrease.toString(), inline: true });
                            }

                            embed.addFields(
                                { name: ' ', value: ' ' },
                                { name: ' ', value: `Estimated Mythic+ rating after completing these dungeons: **${goalData.totalScore}**` }
                            );
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
};