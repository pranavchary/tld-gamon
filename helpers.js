if (!process.env.NODE_ENV) require('dotenv').config();
const BASE_SCORE_LEVEL = 7.5;
const BASE_SCORE_COMPLETION = 37.5;
const dungeonShortnameMap = {
    'BH': 'Brackenhide Hollow',
    'FH': 'Freehold',
    'HOI': 'Halls of Infusion',
    'NL': 'Neltharion\'s Lair',
    'NELT': 'Neltharus',
    'UNDR': 'Underrot',
    'VP': 'Vortex Pinnacle',
    'ULD': 'Uldaman'
};

const getAffixCountByKeyLevel = (keyLevel) => {
    if (keyLevel >= 14) return 3;
    if (keyLevel >= 7) return 2;
    return 1;
}

const getBaseScoreForKeyLevel = (keyLevel) => BASE_SCORE_LEVEL * keyLevel;

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
}

const getDungeonScore = (keyLevel, affixCount) => {
    let extraScore = 0;
    if (keyLevel > 10) {
        const levelsAboveTen = keyLevel - 10;
        extraScore = levelsAboveTen * 3;
    }

    return +(BASE_SCORE_COMPLETION + getBaseScoreForKeyLevel(keyLevel) + getBaseScoreForAffixCount(affixCount) + extraScore).toFixed(1);
}

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
}

module.exports = {
    getAffixCountByKeyLevel,
    getBaseScoreForKeyLevel,
    getBaseScoreForAffixCount,
    getDungeonScore,
    getTargetKeystoneLevel,
    dungeonShortnameMap
}