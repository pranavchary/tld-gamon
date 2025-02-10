const { EmbedBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const {
    capitalizeText,
    sanitizeNumber,
    getDungeonRating,
    DUNGEON_SHORTNAME_MAP
} = require('./helpers');
const { SPEC_SHORTNAME_MAP } = require('../constants');

let currentPrimaryAffix;

/**
 * Checks Raider.io Mythic+ data for any missing dungeon/affix combinations and populates the appropriate arrays with enough data to continue operations.
 * @param {*} rioData Data retrieved from Raider.io
 * @param {number} keyLevel Mythic+ keystone level
 * @returns Fully populated Raider.io data object without missing dungeon/affix combinations in the event that none have been completed for a character
 */
const cleanMythicPlusData = (rioData, keyLevel) => {
    const { mythic_plus_best_runs: bestRuns, mythic_plus_alternate_runs: altRuns, ...cleanData } = rioData;
    const dungeonShortNames = Object.keys(DUNGEON_SHORTNAME_MAP);

    const bestToAdd = dungeonShortNames.filter((d) => !bestRuns.map((r) => r.short_name).includes(d));
    const altToAdd = dungeonShortNames.filter((d) => !altRuns.map((r) => r.short_name).includes(d));

    for (let i = 0; i < bestToAdd.length; i++) {
        const dungeon = {
            mythic_level: keyLevel,
            score: 0,
            dungeon: DUNGEON_SHORTNAME_MAP[bestToAdd[i]],
            short_name: bestToAdd[i],
            num_keystone_updgrades: 1,
            affixes: [{ name: 'Fortified' }]
        };

        bestRuns.push(dungeon);
    }

    for (let i = 0; i < altToAdd.length; i++) {
        const dungeon = {
            mythic_level: keyLevel,
            score: 0,
            dungeon: DUNGEON_SHORTNAME_MAP[altToAdd[i]],
            short_name: altToAdd[i],
            num_keystone_updgrades: 1,
            affixes: [{ name: 'Tyrannical' }]
        };

        const bestVersion = bestRuns.find((r) => r.short_name === dungeon.short_name);
        if (bestVersion && bestVersion.affixes[0].name === 'Tyrannical') {
            dungeon.affixes[0].name = 'Fortified';
        }

        altRuns.push(dungeon);
    }

    cleanData.mythic_plus_best_runs = bestRuns;
    cleanData.mythic_plus_alternate_runs = altRuns;

    return cleanData;
};

/**
 * @param {*} rioData Data retrieved from Raider.io
 * @param {number} keyLevel Mythic+ keystone level
 * @returns Simulation output for completing each Mythic+ dungeon on both Tyrannical and Fortified at the given keystone level within the time limit
 */
const simulateLevel = (rioData, keyLevel) => {
    const data = cleanMythicPlusData(rioData, keyLevel);
    const { mythic_plus_best_runs, mythic_plus_alternate_runs } = data;

    let totalRating = 0;
    let totalPotentialIncrease = 0;
    const dungeons = [];

    for (let bestRun of mythic_plus_best_runs) {
        const dungeon = {
            name: DUNGEON_SHORTNAME_MAP[bestRun.short_name],
            shortName: bestRun.short_name,
            primaryAffix: bestRun.affixes[0].name,
        };

        const simmed = getDungeonRating(keyLevel);
        const rating = sanitizeNumber(bestRun.score * 1.5);

        if (rating > simmed.bestRating) {
            dungeon.potentialIncrease = 0;
            dungeon.rating = rating;
            dungeon.level = bestRun.mythic_level;
        } else {
            dungeon.potentialIncrease = Math.ceil(simmed.bestRating - rating);
            dungeon.rating = simmed.bestRating;
            dungeon.level = keyLevel;
        }

        totalRating += dungeon.rating;
        totalPotentialIncrease += Math.ceil(dungeon.potentialIncrease);

        dungeons.push(dungeon);
    }

    for (let altRun of mythic_plus_alternate_runs) {
        const dungeon = {
            name: DUNGEON_SHORTNAME_MAP[altRun.short_name],
            shortName: altRun.short_name,
            primaryAffix: altRun.affixes[0].name,
        };

        const simmed = getDungeonRating(keyLevel);
        const rating = sanitizeNumber(altRun.score * 0.5);

        if (rating > simmed.altRating) {
            dungeon.potentialIncrease = 0;
            dungeon.rating = rating;
            dungeon.level = altRun.mythic_level;
        } else {
            dungeon.potentialIncrease = Math.ceil(simmed.altRating - rating);
            dungeon.rating = simmed.altRating;
            dungeon.level = keyLevel;
        }

        totalRating += dungeon.rating;
        totalPotentialIncrease += Math.ceil(dungeon.potentialIncrease);
        
        dungeons.push(dungeon);
    }
    
    totalRating = Math.ceil(totalRating);
    dungeons.forEach((d) => d.potentialIncrease = Math.ceil(d.potentialIncrease));

    return { dungeons, totalRating, totalPotentialIncrease };
};

/**
 * @param {*} rioData Data retrieved from Raider.io
 * @returns Calculated output for which Mythic+ dungeons a character can reasonably complete to increase their rating
 */
const getPushData = (rioData) => {
    const cleanData = cleanMythicPlusData(rioData, 2);
    const {
        mythic_plus_best_runs,
        mythic_plus_alternate_runs,
        mythic_plus_scores_by_season: [{ scores : { all: currentRating } }]
    } = cleanData;
    const push = getBlankPushObject();


    for (let run of mythic_plus_best_runs) {
        run.isBestRun = true;
        run.bestRating = sanitizeNumber(run.score * 1.5);
        run.altRating = sanitizeNumber(run.score / 2);
        push[run.short_name][run.affixes[0].name.toLowerCase()] = run;
    }
    for (let run of mythic_plus_alternate_runs) {
        run.isBestRun = false;
        run.bestRating = sanitizeNumber(run.score * 1.5);
        run.altRating = sanitizeNumber(run.score / 2);
        push[run.short_name][run.affixes[0].name.toLowerCase()] = run;
    }

    let totalPotentialIncrease = 0;
    const dungeons = [];

    for (let shortName of Object.keys(push)) {
        const pushDungeon = push[shortName];
        const dungeon = {
            name: DUNGEON_SHORTNAME_MAP[shortName],
            shortName: shortName,
        };
        if (!pushDungeon.fortified.score && !pushDungeon.tyrannical.score) {
            // Use a base score calc for a +2 dungeon with this week's primary affix. If one cannot be found, default to Fortified
            dungeon.primaryAffix = currentPrimaryAffix || 'Fortified';
            dungeon.potentialIncrease = getDungeonRating(2).bestRating;
            dungeon.rating = 0;
            dungeon.level = 2;

            totalPotentialIncrease += Math.ceil(dungeon.potentialIncrease);

            dungeons.push(dungeon);
            continue;
        }
        
        let targetAffix = pushDungeon.fortified.isBestRun ? 'tyrannical' : 'fortified';
        let otherAffix = targetAffix === 'fortified' ? 'tyrannical' : 'fortified';
        let altRating = 0;
        let bestRating = 0;
        let currentDungeonRating = 0;
        // If both affixes have the same key timed (i.e ULD +18 on Tyrannical and Fortified), the dungeon to push should have the current week's affix and its level increased
        // by at least 1. If current week's affix cannot be found, fallback on the target affix.
        if (pushDungeon.tyrannical.mythic_level === pushDungeon.fortified.mythic_level && pushDungeon.tyrannical.num_keystone_upgrades > 0 && pushDungeon.fortified.num_keystone_upgrades > 0) {
            dungeon.primaryAffix = currentPrimaryAffix || capitalizeText(targetAffix);
            targetAffix = dungeon.primaryAffix.toLowerCase();
            otherAffix = targetAffix === 'fortified' ? 'tyrannical' : 'fortified';
            dungeon.level = pushDungeon[targetAffix].mythic_level + pushDungeon[targetAffix].num_keystone_upgrades;
            bestRating = sanitizeNumber(getDungeonRating(dungeon.level).bestRating);
            if (pushDungeon[otherAffix]) altRating = pushDungeon[otherAffix].altRating;
            currentDungeonRating = pushDungeon[targetAffix].bestRating + pushDungeon[otherAffix].altRating;
        } else {
            // When key levels at two affixes are not equal, assume the run calculated here will be your worse (alt) run. This will count less towards the total rating calculation,
            // providing a more accurate minimum rating increase
            dungeon.primaryAffix = capitalizeText(targetAffix);
            dungeon.level = pushDungeon[otherAffix].mythic_level - (pushDungeon[otherAffix].num_keystone_upgrades > 0 ? 0 : 1);
            if (dungeon.level < 2) dungeon.level = 2;
            if (pushDungeon[otherAffix]) bestRating = pushDungeon[otherAffix].bestRating;
            altRating = sanitizeNumber(getDungeonRating(dungeon.level).altRating);
            currentDungeonRating = pushDungeon[otherAffix].bestRating + pushDungeon[targetAffix].altRating;
        }
        dungeon.rating = sanitizeNumber(bestRating + altRating);
        dungeon.potentialIncrease = sanitizeNumber(dungeon.rating - currentDungeonRating);
        
        totalPotentialIncrease += Math.ceil(dungeon.potentialIncrease);

        dungeons.push(dungeon);
    }

    dungeons.forEach((d) => d.potentialIncrease = Math.ceil(d.potentialIncrease));

    return { dungeons, totalRating: Math.floor(currentRating + totalPotentialIncrease), totalPotentialIncrease };
};

/**
 * Determines details such as Mythic+ keystone level and potential Mythic+ rating increase from a dungeon for characters working towards a rating goal. Used by {@link getGoalData}.
 * @param {*} dungeon Dungeon to calculate new information for
 * @param {*} rioData Data retrieved from Raider.io
 * @param {boolean} useRioUpgrades Whether or not to use the Raider.io data provided to increase the Mythic+ keystone level (defaults to *false*).
 * @returns An object containing information on which dungeon to run that will help a character reach their goal Mythic+ rating
 */
const getGoalDungeonToRun = (dungeon, rioData, useRioUpgrades = false) => {
    const result = { ...dungeon };
    
    let upgrade = 1;
    if (useRioUpgrades === true) {
        // Check how many key level upgrades a character got for their best run of the dungeon on this keystone level and increase the recommended key level by that much
        let bestRioDungeon = rioData.mythic_plus_best_runs.find((run) => run.short_name === dungeon.shortName && run.mythic_level === dungeon.level)
            || rioData.mythic_plus_alternate_runs.find((run) => run.short_name === dungeon.shortName && run.mythic_level === dungeon.level);
        upgrade = bestRioDungeon?.num_keystone_upgrades || 1;
    }
    result.level += upgrade;

    // We want to find the same dungeon's run information for the opposite affix to consider as our "alt" run.
    // If it's not found, create an object for a brand new run to fallback on
    let alt = rioData.mythic_plus_best_runs.find((run) => run.short_name === dungeon.shortName && run.affixes[0].name !== dungeon.primaryAffix)
        || rioData.mythic_plus_alternate_runs.find((run) => run.short_name === dungeon.shortName && run.affixes[0].name !== dungeon.primaryAffix);

    alt = convertRioDungeon(alt, 0);
    if (!alt) {
        alt = {
            name: DUNGEON_SHORTNAME_MAP[dungeon.shortName],
            shortName: dungeon.shortName,
            primaryAffix: dungeon.primaryAffix === 'Fortified' ? 'Tyrannical' : 'Fortified',
            potentialIncrease: getDungeonRating(2).altRating,
            rating: 0,
            level: 2,
        };
    }
    const newBestRating = sanitizeNumber(getDungeonRating(result.level).bestRating);
    result.rating = sanitizeNumber(newBestRating + alt.rating);
    result.potentialIncrease = sanitizeNumber(result.rating - dungeon.rating);

    return result;
};

/**
 * @param {*} pushData Calculated output for which Mythic+ dungeons a character can reasonably complete to increase their rating (output of {@link getPushData})
 * @param {*} rioData Data retrieved from Raider.io
 * @param {number} goal The Mythic+ rating a character wants to achieve
 * @returns Calculated output for which Mythic+ dungeons a character can reasonably complete to reach their goal Mythic+ rating
 */
const getGoalData = (pushData, rioData, goal) => {
    const { dungeons: pushDungeons } = pushData;
    let { mythic_plus_scores_by_season: [{ scores : { all: runningTotal } }] } = rioData;
    let dungeonsToRun = [];
    // First, sort the list of dungeons from pushData in descending order by potential rating increase
    // Then, add each dungeon object to the dungeonsToRun array as is to see if the goal rating can be reached by any subset of the recommended push data
    pushDungeons.sort((a, b) => b.potentialIncrease - a.potentialIncrease).every((d) => {
        dungeonsToRun.push(d);
        runningTotal = Math.ceil(runningTotal + d.potentialIncrease);
        return runningTotal < goal;
    });

    // First check for whether or not dungeons received from pushData need to be modified.
    // Separate if block from the next one due to the fact that the next one should trigger a do/while loop when true and this one should not
    if (runningTotal < goal) {
        // Sort current list of dungeons to run in ascending order by keystone level to offer the path of least resistance
        dungeonsToRun = dungeonsToRun.sort((a, b) => a.level - b.level);
        dungeonsToRun.every((d, idx) => {
            const nextDungeon = getGoalDungeonToRun(d, rioData, true);
            dungeonsToRun[idx] = {
                ...nextDungeon,
                potentialIncrease: sanitizeNumber(d.potentialIncrease + nextDungeon.potentialIncrease)
            };
            runningTotal = Math.ceil(runningTotal + nextDungeon.potentialIncrease);
            return runningTotal < goal;
        });
    }

    if (runningTotal < goal) {
        // If the goal rating still has not been met, begin increasing each dungeon's key level by one.
        // Repeat this process until the goal rating has been achieved
        do {
            dungeonsToRun.every((d, idx) => {
                const nextDungeon = getGoalDungeonToRun(d, rioData);
                dungeonsToRun[idx] = {
                    ...nextDungeon,
                    potentialIncrease: sanitizeNumber(d.potentialIncrease + nextDungeon.potentialIncrease)
                };
                runningTotal = Math.ceil(runningTotal + nextDungeon.potentialIncrease);
                return runningTotal < goal;
            });
        } while (runningTotal < goal);
    }

    dungeonsToRun.forEach((d) => d.potentialIncrease = Math.ceil(d.potentialIncrease));
    return { dungeons: dungeonsToRun, totalRating: runningTotal, totalPotentialIncrease: Math.ceil(runningTotal - pushData.totalRating) };
};

/**
 * Used by {@link getPushData}
 * @returns A template object to store data in while calculating which Mythic+ dungeons to complete to increase Mythic+ rating
 */
const getBlankPushObject = () => {
    const result = {};
    for (let shortName of Object.keys(DUNGEON_SHORTNAME_MAP)) {
        result[shortName] = { tyrannical: {}, fortified: {} };
    }

    return result;
};

/**
 * Converts a Raider.io Mythic+ dungeon object into one that results can be shown to a user from. Used by {@link getGoalDungeonToRun}.
 * @param {*} rioDungeon Dungeon data retrieved from Raider.io
 * @param {number} potentialIncrease The potential increase in rating that can be received from completing the given Mythic+ dungeon
 * @param {boolean} isBestRun Whether or not the Raider.io dungeon being converted contains information for a "best" run (defaults to `false`)
 * @returns A reformatted object containing essential information about completing a Mythic+ dungeon. If no Raider.io dungeon data is provided, `undefined` is returned instead.
 */
const convertRioDungeon = (rioDungeon, potentialIncrease, isBestRun = false) => {
    if (!rioDungeon) return undefined;

    const {
        short_name: shortName,
        affixes: [{ name: primaryAffix }],
        score,
        mythic_level: level
    } = rioDungeon;

    return {
        name: DUNGEON_SHORTNAME_MAP[shortName],
        shortName,
        primaryAffix,
        potentialIncrease,
        rating: sanitizeNumber(score * (isBestRun ? 1.5 : 0.5)),
        level
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
 * Retrieves equipped gear and Mythic+ data for the current season for a given character from [Raider.io](https://www.raider.io)
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
                fields: 'gear,mythic_plus_best_runs,mythic_plus_alternate_runs,mythic_plus_scores_by_season:season-df-3'
            }
        });
    } catch (e) {
        return e;
    }
};

/**
 * @returns {Promise<string>} A `Promise` object that resolves to the primary affix for the current week (Tyrannical or Fortified).
 * If one cannot be fetched, the `Promise` object will resolve to an empty string.
 */
const getCurrentWeekPrimaryAffix = () => {
    return axios.get('https://raider.io/api/v1/mythic-plus/affixes', { params: { region: 'us', locale: 'en' } })
        .then(({ data }) => data.affix_details[0].name)
        .catch(() => '');
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
        mythic_plus_scores_by_season: [{ scores : { all: currentRating } }],
        gear: { item_level_equipped: ilvl }
    } = rioData;
    const subcommand = interaction.options.getSubcommand();

    let noDungeonsText = '';
    let description = `*${ilvl} ${SPEC_SHORTNAME_MAP[spec] || spec} ${playerClass}*\n\n`;
    let sortMethod;
    let affixRatingIncreaseText = 'rating increase';
    let closingLine = '';

    switch (subcommand) {
        case 'simulate':
            noDungeonsText = `${name} won't get any rating increase from keys at **Mythic level ${interaction.options.getNumber('level')}**. Try simulating a higher key level.`;
            description += `Here's how your Mythic+ rating could increase by completing the following keys at **Mythic level ${interaction.options.getNumber('level')}** within the time limit:`;
            sortMethod = interaction.options.getBoolean('alphabetical') ? 'alphabetical' : undefined;
            affixRatingIncreaseText = 'Simulated ' + affixRatingIncreaseText;
            closingLine = `Simulated Mythic+ rating after completing these dungeons: **${calcData.totalRating}**`;
            break;
        case 'push':
            noDungeonsText = `Could not calculate data for ${name}. Please try again later.`;
            description += 'Here are some Mythic+ dungeons you could complete within the time limit to increase your rating:';
            sortMethod = interaction.options.getBoolean('alphabetical') ? 'alphabetical' : undefined;
            affixRatingIncreaseText = 'Minimum ' + affixRatingIncreaseText;
            closingLine = `Minimum Mythic+ rating after completing these dungeons: **${calcData.totalRating}**`;
            break;
        case 'goal':
            noDungeonsText = `Could not calculate data for ${name}. Please try again later.`;
            description += `Here is a way you could reach your goal Mythic+ rating of ${interaction.options.getNumber('rating')}:`;
            sortMethod = interaction.options.getString('sort');
            affixRatingIncreaseText = 'Estimated ' + affixRatingIncreaseText;
            closingLine = `Estimated Mythic+ rating after completing these dungeons: **${calcData.totalRating}**`;
            break;
        default:
            break;
    }
    const dungeonList = getSortedCleanedDungeons(calcData.dungeons, sortMethod);

    if (dungeonList.length === 0) {
        return Promise.resolve(interaction.reply({ content: noDungeonsText, ephemeral: true }));
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${name} - ${realm}`, url: profile_url })
        .setDescription(description)
        .setThumbnail(thumbnail_url)
        .addFields(
            { name: 'Current Mythic+ Rating', value: Math.floor(currentRating).toString(), inline: true },
            { name: 'Current Primary Affix', value: currentPrimaryAffix, inline: true },
            { name: ' ', value: ' ' }
        )
        .setFooter({ text: 'Click your character\'s name to view its Raider.io profile' });

    let tyranDungeons = '';
    let tyranIncrease = 0;
    let fortDungeons = '';
    let fortIncrease = 0;
    dungeonList.forEach((dungeon) => {
        if (dungeon.primaryAffix === 'Tyrannical') {
            tyranDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name}`;
            if (subcommand !== 'simulate') tyranDungeons += ` (+${dungeon.level})`;
            tyranDungeons += '\n';
            tyranIncrease += dungeon.potentialIncrease;
        } else {
            fortDungeons += `**${dungeon.potentialIncrease} pt${dungeon.potentialIncrease === 1 ? '' : 's'}** - ${dungeon.name}`;
            if (subcommand !== 'simulate') fortDungeons += ` (+${dungeon.level})`;
            fortDungeons += '\n';
            fortIncrease += dungeon.potentialIncrease;
        }
    });

    if (tyranDungeons.length > 0) embed.addFields({ name: 'Tyrannical', value: tyranDungeons, inline: true });
    if (fortDungeons.length > 0) embed.addFields({ name: 'Fortified', value: fortDungeons, inline: true });
    if (tyranDungeons.length > 0 || fortDungeons.length > 0) {
        embed.addFields({ name: ' ', value: ' ' });
        if (tyranDungeons.length > 0) embed.addFields({ name: affixRatingIncreaseText, value: tyranIncrease.toString(), inline: true });
        if (fortDungeons.length > 0) embed.addFields({ name: affixRatingIncreaseText, value: fortIncrease.toString(), inline: true });
    }

    embed.addFields({ name: ' ', value: ' ' }, { name: ' ', value: closingLine });

    return Promise.resolve(interaction.reply({ embeds: [embed], ephemeral: true }));
};

const calculateDragonflightPreSquishData = async (interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const qp = { realm: interaction.options.getString('realm'), name: interaction.options.getString('character') };
    if (!qp.realm) qp.realm = 'thrall';
    // Remove apostrophes and replace spaces with '-' in realm names
    qp.realm = qp.realm.toLowerCase().replace(/'/gi, '').replace(/\s/gi, '-');
    const response = await requestRaiderIoData(qp);
    if (response.response?.data?.error) {
        console.error(response.request);
        await interaction.reply({ content: `Couldn't retrieve data for **${capitalizeText(qp.name)} - ${capitalizeText(qp.realm)}**. Please try again.`, ephemeral: true });
        return;
    }
    currentPrimaryAffix = await getCurrentWeekPrimaryAffix();
    const { data } = response;
    if (subCommand === 'simulate') {
        const simmedData = simulateLevel(data, interaction.options.getNumber('level'));
        await postMythicPlusEmbedMessage(simmedData, data, interaction);
    } else {
        const pushData = getPushData(data);
        if (subCommand === 'push') {
            await postMythicPlusEmbedMessage(pushData, data, interaction);
        } else if (subCommand === 'goal') {
            const { mythic_plus_scores_by_season: [{ scores : { all: currentRating } }] } = data;
            if (currentRating >= interaction.options.getNumber('rating')) {
                await interaction.reply({
                    content: `Your current Mythic+ rating (${Math.floor(currentRating)}) is higher than/equal to your goal of ${interaction.options.getNumber('rating')}`,
                    ephemeral: true
                });
                return;
            }
            const goalData = getGoalData(pushData, data, interaction.options.getNumber('rating'));
            await postMythicPlusEmbedMessage(goalData, data, interaction);
        }
    }
};

module.exports = { calculateDragonflightPreSquishData };
