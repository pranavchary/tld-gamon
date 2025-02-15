const { MessageFlags } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const {
    DUNGEON_SHORTNAME_MAP,
    // DUNGEON_SHORTNAME_SLUG_MAP,
    sanitizeNumber,
    getDungeonRating
} = require('./helpers');
const { SPEC_SHORTNAME_MAP } = require('../constants');
// const { setCache, getCache } = require('../cache-service');

/**
 * Checks Raider.io Mythic+ data for any missing dungeons and populates the `mythic_plus_best_runs` array with enough data to continue operations.
 * @param {*} rioData Data retrieved from Raider.io
 * @param {number} keyLevel Mythic+ keystone level
 * @returns Fully populated Raider.io data object without missing dungeons in the event that none have been completed for a character
 */
const populateMissingDungeonData = (rioData, keyLevel) => {
    const { mythic_plus_best_runs: bestRuns, ...cleanData } = rioData;
    const dungeonShortNames = Object.keys(DUNGEON_SHORTNAME_MAP);

    const bestToAdd = dungeonShortNames.filter((d) => !bestRuns.map((r) => r.short_name).includes(d));
    for (let i = 0; i < bestToAdd.length; i++) {
        const dungeon = {
            mythic_level: keyLevel,
            score: 0,
            dungeon: DUNGEON_SHORTNAME_MAP[bestToAdd[i]],
            short_name: bestToAdd[i],
            num_keystone_upgrades: 1
        };

        bestRuns.push(dungeon);
    }

    cleanData.mythic_plus_best_runs = bestRuns;
    return cleanData;
};

/**
 * Provides timer completion percentage values for a desired keystone upgrade result
 * @param {number} numUpgrades The number of levels a Mythic keystone will be upgraded by
 * @returns Mythic+ dungeon completion percentage threshold needed to achieve the desired upgrade
 */
const getMinimumTimerPercentageForKeystoneUpgrade = (numUpgrades) => {
    switch (numUpgrades) {
        case 3:
            return 0.4;
        case 2:
            return 0.2;
        case 1:
            return 0;
        case 0:
        default:
            return -0.39;
    }
};

/**
 * Retrieves Mythic+ data for the current season for a given character from [Raider.io](https://www.raider.io)
 * @param {*} qp Object containing query parameter values to be added dynamically
 * @returns Mythic+ data retrieved from Raider.io
 */
const requestRaiderIoData = async (qp) => {
    try {
        return await axios.get('https://raider.io/api/v1/characters/profile', {
            params: {
                ...qp,
                name: qp.name.toLowerCase(),
                region: 'us',
                fields: 'gear,mythic_plus_best_runs,mythic_plus_scores_by_season:current'
            }
        });
    } catch (e) {
        return e;
    }
};

/**
 * @param {*} rioData Data retrieved from Raider.io
 * @param {number} keyLevel Mythic+ keystone level
 * @returns Simulation output for completing each Mythic+ dungeon on both Tyrannical and Fortified at the given keystone level within the time limit
 */
const simulateLevel = (rioData, keyLevel) => {
    const data = populateMissingDungeonData(rioData, keyLevel);
    const { mythic_plus_best_runs } = data;

    let totalRating = 0;
    let totalPotentialIncrease = 0;
    const dungeons = [];

    for (let run of mythic_plus_best_runs) {
        const dungeon = {
            name: DUNGEON_SHORTNAME_MAP[run.short_name],
            shortName: run.short_name
        };

        const timerPercentage = getMinimumTimerPercentageForKeystoneUpgrade(1);
        const simmed = getDungeonRating(keyLevel, timerPercentage);

        if (run.score > simmed) {
            dungeon.potentialIncrease = 0;
            dungeon.rating = run.score;
            dungeon.level = run.mythic_level;
        } else {
            dungeon.potentialIncrease = sanitizeNumber(simmed - run.score);
            dungeon.rating = simmed;
            dungeon.level = keyLevel;
        }

        totalRating += dungeon.rating;
        totalPotentialIncrease += dungeon.potentialIncrease;

        dungeons.push(dungeon);
    }

    return {
        dungeons,
        totalRating: sanitizeNumber(totalRating),
        potentialIncrease: sanitizeNumber(totalPotentialIncrease)
    };
};

/**
 * Used by {@link postMythicPlusEmbedMessage}
 * @param {*[]} dungeons An array of dungeon objects to sort
 * @param {string} sortMethod The method by which to sort the array of dungeons (defaults to `'increase'`, which sorts them from greatest rating increase to least)
 * @returns Sorted array of the given dungeons
 */
const getSortedCleanedDungeons = (dungeons, sortMethod = 'increase') => {
    let result = [];

    if (dungeons && dungeons.length > 0) {
        result = dungeons.filter((d) => d.potentialIncrease > 0);

        if (sortMethod === 'alphabetical') {
            result = result.sort((a, b) => a.name.localeCompare(b.name) || a.level - b.level);
        } else if (sortMethod === 'level') {
            result = result.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
        } else {
            result = result.sort((a, b) => b.potentialIncrease - a.potentialIncrease || a.name.localeCompare(b.name));
        }
    }
    
    return result;
};

/**
 * @param {*} rioData Data retrieved from Raider.io
 * @returns Calculated output for which Mythic+ dungeons a character can reasonably complete to increase their rating
 */
const getPushData = (rioData) => {
    const cleanData = populateMissingDungeonData(rioData, 2);
    const {
        mythic_plus_best_runs,
        mythic_plus_scores_by_season: [{ scores: { all: currentRating } }]
    } = cleanData;

    const maxKeyLevelCompleted = mythic_plus_best_runs
        .sort((a, b) => b.mythic_level - a.mythic_level)[0].mythic_level;
    const maxKeyLevelTimed = mythic_plus_best_runs
        .filter((run) => run.num_keystone_upgrades > 0)
        .sort((a, b) => b.mythic_level - a.mythic_level)[0].mythic_level;
    let totalPotentialIncrease = 0;
    const dungeons = [];

    const timerPercForOneUpgrade = getMinimumTimerPercentageForKeystoneUpgrade(1);
    for (let run of mythic_plus_best_runs) {
        const dungeon = {
            name: DUNGEON_SHORTNAME_MAP[run.short_name],
            shortName: run.short_name
        };
        // If no keys have been completed, all ratings should be calculated for completing a +2
        if (currentRating === 0) {
            dungeon.level = run.mythic_level;
            dungeon.rating = getDungeonRating(dungeon.level, timerPercForOneUpgrade);
        } else if (run.mythic_level === maxKeyLevelCompleted && run.num_keystone_upgrades === 0) {
            // If the best run was overtimed, this dungeon should be timed at the same keystone level to improve rating
            dungeon.level = run.mythic_level;
            dungeon.rating = getDungeonRating(dungeon.level, timerPercForOneUpgrade);
        } else if (run.mythic_level < maxKeyLevelTimed) {
            // If the best run is not at least the same key level as the highest timed key, this dungeon should be completed at that key level
            dungeon.level = maxKeyLevelTimed;
            dungeon.rating = getDungeonRating(dungeon.level, timerPercForOneUpgrade);
        } else {
            // In all other cases, increase the key level for this dungeon by the number of keystone upgrades from the best run
            dungeon.level = run.mythic_level + run.num_keystone_upgrades;
            dungeon.rating = getDungeonRating(dungeon.level, timerPercForOneUpgrade);
        }
        dungeon.potentialIncrease = sanitizeNumber(dungeon.rating - run.score);

        totalPotentialIncrease += dungeon.potentialIncrease;
        dungeons.push(dungeon);
    }

    return {
        dungeons,
        totalRating: sanitizeNumber(currentRating + totalPotentialIncrease),
        potentialIncrease: sanitizeNumber(totalPotentialIncrease)
    };
};

/**
 * @param {*} pushData Calculated output for which Mythic+ dungeons a character can reasonably complete to increase their rating (output of {@link getPushData})
 * @param {*} rioData Data retrieved from Raider.io
 * @param {number} goal The Mythic+ rating a character wants to achieve
 * @returns Calculated output for which Mythic+ dungeons a character can reasonably complete to reach their goal Mythic+ rating
 */
const getGoalData = (pushData, rioData, goal) => {
    const { dungeons: pushDungeons } = pushData;
    const { mythic_plus_scores_by_season: [{ scores : { all: startingRating } }] } = rioData;
    let runningTotal = startingRating;
    let dungeonsToRun = [];
    // First, sort the list of dungeons from pushData in descending order by potential rating increase
    // Then, add each dungeon object to the dungeonsToRun array as is to see if the goal rating can be reached by any subset of the recommended push data
    pushDungeons.sort((a, b) => b.potentialIncrease - a.potentialIncrease).every((d) => {
        dungeonsToRun.push(d);
        runningTotal += d.potentialIncrease;
        return runningTotal < goal;
    });

    if (runningTotal < goal) {
        // If the goal rating hasn't been met solely using "push" data, begin increasing each dungeon's key level by one.
        // Repeat this process until the goal rating has been achieved
        do {
            dungeonsToRun.every((d, idx, self) => {
                const newRating = getDungeonRating(d.level + 1, getMinimumTimerPercentageForKeystoneUpgrade(1));
                const potentialIncreaseChange = sanitizeNumber(newRating - d.rating);
                self[idx] = {
                    ...d,
                    level: d.level + 1,
                    rating: newRating,
                    potentialIncrease: sanitizeNumber(d.potentialIncrease + potentialIncreaseChange)
                };
                runningTotal += potentialIncreaseChange;
                return runningTotal < goal;
            });
        } while (runningTotal < goal);
    }

    return {
        dungeons: dungeonsToRun,
        totalRating: runningTotal,
        potentialIncrease: runningTotal - startingRating
    };
};

/**
 * Dynamically creates and posts a Discord embed message in response to a user executing one of the `/gamon` subcommands provided there is data to be shown
 * @param {*} calcData Calculated data for the given subcommand that should be presented to the user
 * @param {*} rioData Data retrieved from Raider.io
 * @param {*} interaction Discord.js bot interaction object containing information about user input and methods to respond to the user with
 * @returns A `Promise` containing the response to be shown to the user. If there is data to present, this will be in the form of a Discord embed, otherwise a plain message
 * indicating that there is no data to show will appear
 */
const postMythicPlusEmbedMessage = (calcData, rioData, interaction) => {
    const {
        name,
        class: playerClass,
        active_spec_name: spec,
        realm,
        profile_url,
        thumbnail_url,
        mythic_plus_scores_by_season: [{ scores: { all: currentRating } }],
        gear: { item_level_equipped: ilvl }
    } = rioData;
    const subCommand = interaction.options.getSubcommand();

    let noDungeonsText = '';
    let description = `*${ilvl} ${SPEC_SHORTNAME_MAP[spec] || spec} ${playerClass}*\n\n`;
    let sortMethod;
    let closingLine = '';

    switch (subCommand) {
        case 'simulate':
            noDungeonsText = `${name} won't get any rating increase from keys at **Mythic level ${interaction.options.getNumber('level')}**. Try simulating a higher key level.`;
            description += `Here's how your Mythic+ rating could increase by completing the following keys at **Mythic level ${interaction.options.getNumber('level')}** within the time limit:`;
            sortMethod = interaction.options.getBoolean('alphabetical') ? 'alphabetical' : undefined;
            closingLine = `Simulated Mythic+ rating after completing these dungeons: **${Math.floor(calcData.totalRating)}**`;
            break;
        case 'push':
            noDungeonsText = `Could not calculate data for ${name}. Please try again later.`;
            description += 'Here are some Mythic+ dungeons you could complete within the time limit to increase your rating:';
            sortMethod = interaction.options.getBoolean('alphabetical') ? 'alphabetical' : undefined;
            closingLine = `Estimated Mythic+ rating after completing these dungeons: **${Math.floor(calcData.totalRating)}**`;
            break;
        case 'goal':
            noDungeonsText = `Could not calculate data for ${name}. Please try again later.`;
            description += `Here is a way you could reach your goal Mythic+ rating of ${interaction.options.getNumber('rating')}:`;
            sortMethod = interaction.options.getString('sort');
            closingLine = `Estimated Mythic+ rating after completing these dungeons: **${Math.floor(calcData.totalRating)}**`;
            break;
        default:
            return Promise.resolve(interaction.reply({ content: 'I don\'t understand that command... Try again', flags: MessageFlags.Ephemeral }));
    }

    const dungeonList = getSortedCleanedDungeons(calcData.dungeons, sortMethod);
    if (dungeonList.length === 0) {
        return Promise.resolve(interaction.reply({ content: noDungeonsText, flags: MessageFlags.Ephemeral }));
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${name} - ${realm}`, url: profile_url })
        .setDescription(description)
        .setThumbnail(thumbnail_url)
        .addFields(
            { name: 'Current Mythic+ Rating', value: Math.floor(currentRating).toString(), inline: true },
            { name: ' ', value: ' ' }
        )
        .setFooter({ iconURL: 'https://cdn.raiderio.net/images/brand/Icon_2ColorWhite.png', text: 'Click your character\'s name to view its Raider.io profile' });

    dungeonList.forEach((d) => {
        embed.addFields({ name: `${d.name} +${d.level}`, value: `${Math.floor(d.potentialIncrease)} pt${d.potentialIncrease === 1 ? '' : 's'}`, inline: true });
    });

    if (dungeonList.length > 0) {
        embed.addFields(
            { name: ' ', value: ' ' },
            { name: 'Potential Rating Increase', value: Math.floor(calcData.potentialIncrease).toString() },
            { name: ' ', value: ' ' }
        );
    }
    embed.addFields({ name: ' ', value: closingLine });

    return Promise.resolve(interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral }));
};

const calculateTheWarWithinData = async (interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const qp = { realm: interaction.options.getString('realm'), name: interaction.options.getString('character') };
    if (!qp.realm) qp.realm = 'thrall';
    // Remove apostrophes and replace spaces with '-' in realm names
    qp.realm = qp.realm.toLowerCase().replace(/'/gi, '').replace(/\s/gi, '-');
    const response = await requestRaiderIoData(qp);
    if (response.response?.data?.error) {
        console.error(response.request);
        await interaction.reply({ content: `Couldn't retrieve data for **${qp.name} - ${qp.realm}**. Please try again.`, flags: MessageFlags.Ephemeral });
        return;
    }

    const { data } = response;
    if (subCommand === 'simulate') {
        const simmedData = simulateLevel(data, interaction.options.getNumber('level'));
        await postMythicPlusEmbedMessage(simmedData, data, interaction);
    } else {
        const pushData = getPushData(data);
        if (subCommand === 'push') {
            await postMythicPlusEmbedMessage(pushData, data, interaction);
        } else if (subCommand === 'goal') {
            const {
                name,
                mythic_plus_scores_by_season: [{ scores : { all: currentRating } }]
            } = data;
            if (currentRating >= interaction.options.getNumber('rating')) {
                await interaction.reply({
                    content: `${name}'s current Mythic+ rating (${Math.floor(currentRating)}) is higher than/equal to the goal of ${interaction.options.getNumber('rating')}`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            const goalData = getGoalData(pushData, data, interaction.options.getNumber('rating'));
            await postMythicPlusEmbedMessage(goalData, data, interaction);
        }
    }
};

// CURRENTlY UNUSED METHODS
// const getKeystoneUpgradeForTimerPercentage = (timerPercentage) => {
//     if (timerPercentage < 0) return 0;
//     if (timerPercentage < 0.2) return 1;
//     if (timerPercentage < 0.4) return 2;
//     return 3;
// };

// const getDungeonTimeLimitSeconds = async (shortName) => {
//     let timeLimit = getCache(shortName);
//     if (!timeLimit) {
//         try {
//             const slug = DUNGEON_SHORTNAME_SLUG_MAP[shortName];
//             const response = await axios.get('https://raider.io/api/v1/mythic-plus/runs', {
//                 params: {
//                     season: 'season-tww-1',
//                     dungeon: slug
//                 }
//             });
//             if (response.data.rankings && response.data.rankings.length && response.data.rankings.length > 0) {
//                 timeLimit = response.data.rankings[0].run.keystone_time_ms / 1000;
//                 setCache(shortName, timeLimit);
//             }
//         } catch (e) {
//             console.error(`[RAIDERIO] Error retrieving dungeon timer for ${shortName}`);
//             console.error(e);
//         }
//     }

//     return timeLimit;
// };

module.exports = { calculateTheWarWithinData };

