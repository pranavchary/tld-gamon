if (!process.env.NODE_ENV) require('dotenv').config();

const { env: { GAMON_SHOUT_ID, STORM_BOLT_ID, GOREHOWL_ID } } = process;
const SPEC_SHORTNAME_MAP = {
    Affliction: 'Aff',
    Assassination: 'Ass',
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
    'Many times have I fallen at the hands of an orc, and many times have I risen again.',
    'For every orc that struck me, I will cleave a thousand of their skulls!',
    'For the Horde, my friend.',
    'I may be bruised and beaten, but the hatred boils inside me.',
    'I need a new axe... My current one, it has cleaved too many skulls.'
];
const BUTT_QUOTES = [
    'Many times have I fallen on my butt at the hands of an orc, and many times I have risen again... sore, but unbroken!',
	'For every orc that struck my rear, I will cleave a thousand of their skulls! None shall escape my vengeance... or my mighty backside!',
	'For the Horde, my friend... and for my bruised butt, which has suffered enough!',
	'I may be bruised and beaten, my butt aching from countless falls, but the hatred boils inside me (so does the soreness...).',
	'I needs a new axe... My current one, it has cleaved too many skulls, yet still, my butt has felt too many kicks!'
];

const SHOUT_QUOTES = [
    'THIS ENDS HERE!',
    `<:gamon_shout:${GAMON_SHOUT_ID}> I, GAMON, WILL SAVE US!`,
    `<:gorehowl:${GOREHOWL_ID}> TASTE MY AXE!`,
    `<:storm_bolt:${STORM_BOLT_ID}> I AM A STORM OF PAIN!`,
];

const KEY_LEVEL_TOO_HIGH_QUOTES = [
    'Gamon has faced many foes... but this number is too mighty, even for Gamon\'s mighty butt! Choose a number between 2 and 20, or Gamon will sit in sadness.',
	'Gamon\'s butt has been kicked many times, but never by a number this high! Pick a number between 2 and 20, or Gamon\'s rear shall know true defeat.',
	'Even Gamon\'s glorious booty has limits... Your number must be between 2 and 20, or Gamon will be forced to sit this one out... painfully.',
	'Gamon does not fear battle, but Gamon fears numbers too big! Pick a number between 2 and 20, or Gamon\'s behind will tremble in confusion.',
	'Gamon\'s butt is strong, but your number is stronger! Pick between 2 and 20, or Gamon will be forced to sulk... on his mighty behind.',
	'Gamon has been punted out of Orgrimmar many times... but never by a number this large! Choose between 2 and 20, or Gamon\'s butt shall suffer once more.'
];

module.exports = {
    SPEC_SHORTNAME_MAP,
    SAY_QUOTES,
    BUTT_QUOTES,
    SHOUT_QUOTES,
    KEY_LEVEL_TOO_HIGH_QUOTES
};
