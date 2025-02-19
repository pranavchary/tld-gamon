const DUNGEON_SHORTNAME_MAP = {
    ARAK: 'Ara-Kara',
    COT: 'City of Threads',
    GB: 'Grim Batol',
    MISTS: 'Mists of Tirna Scithe',
    SIEGE: 'Seige of Boralus',
    DAWN: 'Dawnbreaker',
    NW: 'Necrotic Wake',
    SV: 'Stonevault',
};

const DUNGEON_SHORTNAME_SLUG_MAP = {
    ARAK: 'arakara-city-of-echoes',
    COT: 'city-of-threads',
    GB: 'grim-batol',
    MISTS: 'mists-of-tirna-scithe',
    SIEGE: 'siege-of-boralus',
    DAWN: 'the-dawnbreaker',
    NW: 'the-necrotic-wake',
    SV: 'the-stonevault'
};

const KEYLEVEL_BASESCORE_MAP = {
    2: 165,
    3: 180,
    4: 205,
    5: 220,
    6: 235,
    7: 265,
    8: 280,
    9: 295,
    10: 320,
    11: 335,
    12: 365,
    13: 380,
    14: 395,
    15: 410,
    16: 425,
    17: 440,
    18: 455,
    19: 470,
    20: 485
};

const MAX_KEY_LEVEL_AVAILABLE = Object.keys(KEYLEVEL_BASESCORE_MAP)[Object.keys(KEYLEVEL_BASESCORE_MAP).length - 1];

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
 * Calculates how many points might be recieved for completing a Mythic+ dungeon with the given parameters
 * @param {number} keyLevel Mythic+ keystone level
 * @param {number} timerPercentage How much of the time limit was used to complete the dungeon
 * @returns {number} A calculated Mythic+ dungeon rating
 */
const getDungeonRating = (keyLevel, timerPercentage) => {
    if (timerPercentage <= -0.4) return 0;
    // This capped key level variable is necessary to avoid trying to get baseScore when it's not defined for higher keys
    const cappedKeyLevel = keyLevel <= MAX_KEY_LEVEL_AVAILABLE ? keyLevel : MAX_KEY_LEVEL_AVAILABLE;

    const baseScore = KEYLEVEL_BASESCORE_MAP[cappedKeyLevel];
    let overtimePenalty = 0;
    if (timerPercentage < 0 && keyLevel > 11) {
        overtimePenalty = 15 * (keyLevel - 8);
    } else if (timerPercentage < 0 && keyLevel > 9) {
        overtimePenalty = 15 * (keyLevel - 9);
    } else if (timerPercentage < 0) {
        overtimePenalty = 15;
    }

    return sanitizeNumber(baseScore + (37.5 * timerPercentage) - overtimePenalty);
};

/**
 * Indicates if a character has acheived Keystone Explorer or not
 * @param {number} currentRating Character's current Mythic+ rating
 * @returns `true` if the character has completed the Keystone Explorer achievement, `false` otherwise
 */
const isKeystoneExplorer = (currentRating) => currentRating > 0;

/**
 * Indicates if a character has acheived Keystone Conquerer or not
 * @param {number} currentRating Character's current Mythic+ rating
 * @returns `true` if the character has completed the Keystone Conquerer achievement, `false` otherwise
 */
const isKeystoneConquerer = (currentRating) => currentRating >= 1500;

/**
 * Indicates if a character has acheived Keystone Master or not
 * @param {number} currentRating Character's current Mythic+ rating
 * @returns `true` if the character has completed the Keystone Master achievement, `false` otherwise
 */
const isKeystoneMaster = (currentRating) => currentRating >= 2000;

/**
 * Indicates if a character has acheived Keystone Hero or not
 * @param {number} currentRating Character's current Mythic+ rating
 * @returns `true` if the character has completed the Keystone Hero achievement, `false` otherwise
 */
const isKeystoneHero = (currentRating) => currentRating >= 2500;

/**
 * Indicates if a character has achieved Keystone Hero for a dungeon or not
 * @param {number} keyLevel The keystone level for the best run of a dungeon
 * @param {number} numKeystoneUpgrades How many levels the keystone was upgraded by in the run
 * @returns `true` if Keystone Hero has been achieved for the dungeon, `false` otherwise
 */
const isDungeonKeystoneHero = (keyLevel, numKeystoneUpgrades) => keyLevel >= 10 && numKeystoneUpgrades >= 1;

module.exports = {
    DUNGEON_SHORTNAME_MAP,
    DUNGEON_SHORTNAME_SLUG_MAP,
    MAX_KEY_LEVEL_AVAILABLE,
    capitalizeText,
    sanitizeNumber,
    getDungeonRating,
    isKeystoneExplorer,
    isKeystoneConquerer,
    isKeystoneMaster,
    isKeystoneHero,
    isDungeonKeystoneHero
};
