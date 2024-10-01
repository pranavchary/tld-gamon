if (!process.env.NODE_ENV) require('dotenv').config();
const { env: { GAMON_SHOUT_ID, STORM_BOLT_ID, GOREHOWL_ID } } = process;
const BASE_SCORE_LEVEL = 7.5;
const BASE_SCORE_COMPLETION = 37.5;
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
const SPEC_SHORTNAME_MAP = {
    Affliction: 'Aff',
    Assassination: 'Sin',
    'Beast Mastery': 'BM',
    Brewmaster: 'BM',
    Augmentation: 'Aug',
    Demonology: 'Demo',
    Destruction: 'Destro',
    Devastation: 'Dev',
    Discipline: 'Disc',
    Elemental: 'Ele',
    Enhancement: 'Enhance',
    Marksmanship: 'MM',
    Mistweaver: "MW",
    Preservation: 'Pres',
    Protection: 'Prot',
    Restoration: 'Resto',
    Retribution: 'Ret',
    Subtlety: 'Sub',
    Windwalker: 'WW'
};

const SAY_QUOTES = [
    'Many times have I fallen at the hands of an orc and many times have I risen again.',
    'For every orc that struck me, I will cleave a thousand of their skulls! This ends here!',
    'For the Horde, my friend.',
    'I may be bruised and beaten, but the hatred boils inside me.'
];

const SHOUT_QUOTES = [
    'THIS ENDS HERE!',
    `<:gamon_shout:${GAMON_SHOUT_ID}> I, GAMON, WILL SAVE US!`,
    `<:gorehowl:${GOREHOWL_ID}> TASTE MY AXE!`,
    `<:storm_bolt:${STORM_BOLT_ID}> I AM A STORM OF PAIN!`,
];

module.exports = {
    BASE_SCORE_LEVEL,
    BASE_SCORE_COMPLETION,
    DUNGEON_SHORTNAME_MAP,
    SPEC_SHORTNAME_MAP,
    SAY_QUOTES,
    SHOUT_QUOTES
};
