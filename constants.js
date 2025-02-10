if (!process.env.NODE_ENV) require('dotenv').config();

const { env: { GAMON_SHOUT_ID, STORM_BOLT_ID, GOREHOWL_ID } } = process;
const SPEC_SHORTNAME_MAP = {
    Affliction: 'Aff',
    Assassination: 'Sin',
    Augmentation: 'Aug',
    'Beast Mastery': 'BM',
    Demonology: 'Demo',
    Destruction: 'Destro',
    Devastation: 'Dev',
    Discipline: 'Disc',
    Elemental: 'Ele',
    Enhancement: 'Enhance',
    Marksmanship: 'MM',
    Preservation: 'Pres',
    Protection: 'Prot',
    Restoration: 'Resto',
    Retribution: 'Ret',
    Subtlety: 'Sub',
};

const SAY_QUOTES = [
    'Many times have I fallen at the hands of an orc and many times have I risen again.',
    'For every orc that struck me, I will cleave a thousand of their skulls!',
    'For the Horde, my friend.',
    'I may be bruised and beaten, but the hatred boils inside me.',
    'I need a new axe... My current one, it has cleaved too many skulls.'
];

const SHOUT_QUOTES = [
    'THIS ENDS HERE!',
    `<:gamon_shout:${GAMON_SHOUT_ID}> I, GAMON, WILL SAVE US!`,
    `<:gorehowl:${GOREHOWL_ID}> TASTE MY AXE!`,
    `<:storm_bolt:${STORM_BOLT_ID}> I AM A STORM OF PAIN!`,
];

module.exports = {
    SPEC_SHORTNAME_MAP,
    SAY_QUOTES,
    SHOUT_QUOTES
};
