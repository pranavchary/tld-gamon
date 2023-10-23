const { BASE_SCORE_LEVEL, BASE_SCORE_COMPLETION } = require('./constants');

/**
 * @param {string} text The text to capitalize
 * @returns A version of the provided text with the first letter capitalized and the remaining letters in lowercase
 */
const capitalizeText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};

/**
 * Used to eliminate floating point arithmetic issues that frequently occur in JavaScript
 * @param {number} num The number to sanitize. Can be a single number, a single math operation, or a series of operations that results in a number output
 * @returns The number provided fixed to a single decimal point
 */
const sanitizeNumber = (num) => +(num.toFixed(1));

/**
 * Determines how many affixes will appear for a dungeon based on its keystone level
 * @param {number} keyLevel Mythic+ keystone level
 * @returns Number of affixes that will appear
 */
const getAffixCountByKeyLevel = (keyLevel) => {
    if (keyLevel >= 14) return 3;
    if (keyLevel >= 7) return 2;
    return 1;
};

/**
 * Does not account for timer bonuses (+2 and +3 keystone upgrades)
 * @param {number} keyLevel Mythic+ keystone level
 * @returns Base score for completing a Mythic+ dungeon at the given keystone level within the time limit
 */
const getBaseScoreForKeyLevel = (keyLevel) => BASE_SCORE_LEVEL * keyLevel;

/**
 * @param {number} affixCount Number of affixes that appear in a Mythic+ dungeon
 * @returns Score for completing a Mythic+ dungeon with the given number of affixes within the time limit
 */
const getBaseScoreForAffixCount = (affixCount) => {
    let score = 0;

    for (let i = 0; i < affixCount; i++) {
        if (i === 0) {
            score += BASE_SCORE_LEVEL;
        } else {
            score += BASE_SCORE_LEVEL * 2;
        }
    }

    return score;
};

/**
 * Includes check for keystone levels above 10, but does not account for timer bonuses (+2 and +3 keystone upgrades)
 * @param {number} keyLevel Mythic+ keystone level
 * @returns An object containing the dungeon score and weighted ratings for best and alternate runs for a completed Mythic+ dungeon
 */
const getDungeonRating = (keyLevel) => {
    const affixCount = getAffixCountByKeyLevel(keyLevel);
    let extraScore = 0;
    if (keyLevel > 10) {
        extraScore = (keyLevel - 10) * 3;
    }

    const bestRating = sanitizeNumber(BASE_SCORE_COMPLETION + getBaseScoreForKeyLevel(keyLevel) + getBaseScoreForAffixCount(affixCount) + extraScore);
    return { bestRating, altRating: sanitizeNumber(bestRating / 3), score: sanitizeNumber(bestRating / 1.5) };
};

/* @todo Check if this method can/should be used anywhere */
const getTargetKeystoneLevel = (highestRunDungeon, currentDungeon) => {
    const levelDiff = highestRunDungeon.mythic_level - currentDungeon.mythic_level;
    let targetLevel = highestRunDungeon.mythic_level;

    if (levelDiff <= 3 && highestRunDungeon.num_keystone_upgrades === 0 && currentDungeon.num_keystone_upgrades >= 0) {
        targetLevel += currentDungeon.num_keystone_upgrades - levelDiff;
    } else if (highestRunDungeon.num_keystone_upgrades === 0 && highestRunDungeon.name === currentDungeon.name) {
        targetLevel -= 1;
    } else {
        targetLevel += highestRunDungeon.num_keystone_upgrades - levelDiff;
    }

    return targetLevel;
};

module.exports = {
    capitalizeText,
    sanitizeNumber,
    getDungeonRating,
    getTargetKeystoneLevel
};
