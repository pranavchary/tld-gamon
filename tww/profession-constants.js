const PROFESSIONS = {
    Alchemy: 'alchemy',
    Blacksmithing: 'blacksmithing',
    Cooking: 'cooking',
    Enchanting: 'enchanting',
    Engineering: 'engineering',
    Herbalism: 'herbalism',
    Inscription: 'inscription',
    Jewelcrafting: 'jewelcrafting',
    Leatherworking: 'leatherworking',
    Mining: 'mining',
    Skinning: 'skinning',
    Tailoring: 'tailoring'
};

const CATEGORIES = {
    Bags: 'bags',
    Consumable: 'consumable',
    Gear: 'gear',
    GemsTinkers: 'gems-tinkers',
    ProfessionEquipment: 'prof-equipment',
    Reagent: 'reagent',
    Other: 'other'
};

const CRAFTERS = {
    Sett: 'Sætt',
    Garen: 'Gæren',
    Taric: 'Tæric',
    Tyrianth: 'Tyriænth',
    Mordekaiser: 'Mordekaisær',
    Aatrox: 'Aætrox',
    Arthas: 'Ärthæs',
    Leona: 'Leonæ',
    DrMundo: 'Drmundo',
    Darius: 'Dærius',
    Olaf: 'Olæff',
    Nasus: 'Næsus',
    JarvanIV: 'Jarvæniv',
    Artura: 'Ärtura',
    Jax: 'Jæxx',
    Karma: 'Karmæ',
    Lux: 'Lüx',
    Hera: 'Heræ',
    Rengar: 'Rængar',
    Quickslice: 'Quickslicæ',
    Pyke: 'Pykæ',
    AurelionSol: 'Äurelionsol',
    Hotahumm: 'Hotahumm',
    LeeSin: 'Leæsin',
    Volibear: 'Volibeær',
    Ryze: 'Ryzæ',
    Evalynn: 'Evælynn',
    Varus: 'Værus',
    Swain: 'Swæin',
    Tyrainth: 'Tyrainth',
    Akali: 'Akæli',
    Artamis: 'Ärtæmis',
    Kindred: 'Kindræd',
    Heimerdinger: 'Heimerdingær',
    RekSai: 'Ræksai',
    Annie: 'Anniæ',
    LeBlanc: 'Læblanc',
    Soraka: 'Sorakæ',
    Lissandra: 'Lissandræ',
    Genianna: 'Genianna'
};

const PROFESSION_OPTIONS = [
    { label: 'Alchemy', value: PROFESSIONS.Alchemy },
    { label: 'Blacksmithing', value: PROFESSIONS.Blacksmithing },
    { label: 'Cooking', value: PROFESSIONS.Cooking },
    { label: 'Enchanting', value: PROFESSIONS.Enchanting },
    { label: 'Engineering', value: PROFESSIONS.Engineering },
    { label: 'Herbalism', value: PROFESSIONS.Herbalism },
    { label: 'Inscription', value: PROFESSIONS.Inscription },
    { label: 'Jewelcrafting', value: PROFESSIONS.Jewelcrafting },
    { label: 'Leatherworking', value: PROFESSIONS.Leatherworking },
    { label: 'Mining', value: PROFESSIONS.Mining },
    { label: 'Skinning', value: PROFESSIONS.Skinning },
    { label: 'Tailoring', value: PROFESSIONS.Tailoring }
];

const CATEGORY_OPTIONS = [
    { label: 'Bags', value: CATEGORIES.Bags },
    { label: 'Consumable', value: CATEGORIES.Consumable },
    { label: 'Gear', value: CATEGORIES.Gear },
    { label: 'Gems/Tinkers', value: CATEGORIES.GemsTinkers },
    { label: 'Profession Equipment', value: CATEGORIES.ProfessionEquipment },
    { label: 'Reagent', value: CATEGORIES.Reagent },
    { label: 'Other', value: CATEGORIES.Other },
];

const CRAFTING_MAP = {
    [PROFESSIONS.Alchemy]: {
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Sett]: [
                'Flask of Alchemical Chaos',
                'Flask of Tempered Mastery',
                'Flask of Tempered Swiftness',
                'Flask of Tempered Versatility',
                'Flask of Tempered Aggression',
                'Flask of Saving Graces',
                'Phial of Truesight',
                'Phial of Bountiful Seasons',
                'Phial of Concentrated Ingenuity',
                'Phial of Enhanced Ambidexterity',
                'Vicious Flask of Honor',
                'Vicious Flask of Classical Spirits',
                'Vicious Flask of Manifested Fury',
                'Vicious Flask of the Wrecking Ball',
                'Algari Healing Potion',
                'Algari Mana Potion',
                'Cavedweller\'s Delight',
                'Slumbering Soul Serum',
                'Draught of Silent Footfalls',
                'Draught of Shocking Revelations',
                'Potion of the Reborn Cheetah',
                'Frontline Potion',
                'Grotesque Vial',
                'Tempered Potion',
                'Potion of Unwavering Focus',
            ]
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Sett]: ['Petal Powder', 'Bubbling Mycobloom Culture']
        }
    },
    [PROFESSIONS.Blacksmithing]: {
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Taric]: [
                'Ironclaw Weightstone',
                'Ironclaw Whetstone',
                'Ironclaw Razorstone',
            ]
        },
        [CATEGORIES.Gear]: {
            [CRAFTERS.Mordekaiser]: [
                'Charged Claymore',
                'Charged Hexsword',
                'Charged Invoker',
                'Charged Slicer',
                'Everforged Dagger',
                'Everforged Longsword',
                'Everforged Stabber',
                'Everforged Warglaive',
            ],
            [CRAFTERS.Aatrox]: [
                'Charged Crusher',
                'Charged Facesmasher',
                'Charged Halberd',
                'Charged Runeaxe',
                'Everforged Greataxe',
                'Everforged Mace',
            ],
            [CRAFTERS.Arthas]: ['Everforged Breastplate'],
            [CRAFTERS.Leona]: ['Everforged Defender'],
            [CRAFTERS.DrMundo]: ['Everforged Legplates'],
            [CRAFTERS.Darius]: ['Everforged Gauntlets'],
            [CRAFTERS.Olaf]: ['Everforged Greatbelt'],
            [CRAFTERS.Nasus]: ['Everforged Helm'],
            [CRAFTERS.JarvanIV]: ['Everforged Pauldrons'],
            [CRAFTERS.Artura]: ['Everforged Sabatons'],
            [CRAFTERS.Jax]: ['Everforged Vambraces'],
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Tyrianth]: [
                'Artisan Blacksmith\'s Toolset',
                'Artisan Blacksmith\'s Hammer',
                'Artisan Leatherworker\'s Knife',
                'Artisan Leatherworker\'s Toolset',
                'Artisan Needle Set',
                'Artisan Pickaxe',
                'Artisan Sickle',
                'Artisan Skinning Knife',
            ],
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Garen]: ['Sanctified Alloy'],
        }
    },
    [PROFESSIONS.Cooking]: {
        [CRAFTERS.Sett]: [
            'Feast of the Midnight Masquerade',
            'Feast of the Divine Day',
            'The Sushi Special',
        ]
    },
    [PROFESSIONS.Enchanting]: {
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Karma]: [
                'Algari Mana Oil',
                'Oil of Beledar\'s Grace',
                'Oil of Deep Toxins',
                'Enchant Boots - Cavalry\'s March',
                'Enchant Boots - Defender\'s March',
                'Enchant Boots - Scout\'s March',
                'Enchant Bracers - Chant of Armored Avoidance',
                'Enchant Bracers - Chant of Armored Leech',
                'Enchant Bracers - Chant of Armored Speed',
                'Enchant Chest - Council\'s Intellect',
                'Enchant Chest - Crystalline Radiance',
                'Enchant Chest - Oathsworn\'s Strength',
                'Enchant Chest - Stormrider\'s Agility',
                'Enchant Cloak - Chant of Burrowing Rapidity',
                'Enchant Cloak - Chant of Leeching Fangs',
                'Enchant Cloak - Chant of Winged Grace',
                'Enchant Ring - Radiant Critical Strike',
                'Enchant Ring - Radiant Haste',
                'Enchant Ring - Radiant Mastery',
                'Enchant Ring - Radiant Versatility',
                'Enchant Weapon - Authority of Air',
                'Enchant Weapon - Authority of Fiery Resolve',
                'Enchant Weapon - Authority of Radiant Power',
                'Enchant Weapon - Authority of Storms',
                'Enchant Weapon - Authority of the Depths',
            ],
        },
        [CATEGORIES.Gear]: {
            [CRAFTERS.Lux]: ['Scepter of Radiant Magics']
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Lux]: ['Runed Null Stone Rod', 'Runed Ironclaw Rod'],
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Karma]: ['Mirror Powder', 'Concentration Concentrate']
        },
        [CATEGORIES.Other]: {
            [CRAFTERS.Karma]: [
                'Gleeful Glamour - Blood Elf',
                'Gleeful Glamour - Dark Iron Dwarf',
                'Gleeful Glamour - Draenei',
                'Gleeful Glamour - Dwarf',
                'Gleeful Glamour - Earthen',
                'Gleeful Glamour - Gnome',
                'Gleeful Glamour - Goblin',
                'Gleeful Glamour - Highmountain Tauren',
                'Gleeful Glamour - Human',
                'Gleeful Glamour - Kul Tiran',
                'Gleeful Glamour - Lightforged Draenei',
                'Gleeful Glamour - Mag\'har Orc',
                'Gleeful Glamour - Mechagnome',
                'Gleeful Glamour - Night Elf',
                'Gleeful Glamour - Nightborne',
                'Gleeful Glamour - Orc',
                'Gleeful Glamour - Pandaren',
                'Gleeful Glamour - Tauren',
                'Gleeful Glamour - Troll',
                'Gleeful Glamour - Undead',
                'Gleeful Glamour - Void Elf',
                'Gleeful Glamour - Vulpera',
                'Gleeful Glamour - Worgen',
                'Gleeful Glamour - Zandalari Troll'
            ]
        }
    },
    [PROFESSIONS.Engineering]: {
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Nasus]: [
                'Potion Bomb of Power',
                'Potion Bomb of Recovery',
                'Potion Bomb of Speed',
                'Convincingly Realistic Jumper Cables',
                'Pausing Pylon',
                'Algari Repair Bot 11O',
                'Portable Profession Possibility Projector'
            ]
        },
        [CATEGORIES.Gear]: {
            [CRAFTERS.Aatrox]: [
                'Blasting Bracers',
                'Clanking Cuffs',
                'Venting Vambraces',
                'Whirring Wristwraps'
            ],
            [CRAFTERS.Arthas]: ['P.0.W. x2'],
            [CRAFTERS.Quickslice]: [
                'Dangerous Distraction Inhibitor',
                'Overclocked Idea Generator',
                'Studious Brilliance Expeditor',
                'Supercharged Thought Enhancer'
            ]
        },
        [CATEGORIES.GemsTinkers]: {
            [CRAFTERS.Nasus]: ['Tinker: Earthen Delivery Drill', 'Tinker: Heartseeking Health Injector']
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Pyke]: [
                'Aqirite Fueled Samophlange',
                'Aqirite Brainwave Projector',
                'Aqirite Fisherfriend',
                'Aqirite Miner\'s Headgear',
                'Lapidary\'s Aqirite Clamps',
                'Miner\'s Aqirite Hoard',
                'Spring-Loaded Aqirite Fabric Cutters'
            ]
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Rengar]: ['Spare Parts'],
            [CRAFTERS.Nasus]: [
                'Blame Redirection Device',
                'Complicated Fuse Box',
                'Recalibrated Safety Switch',
                'Concealed Chaos Module',
                'Energy Redistribution Beacon',
                'Pouch of Pocket Grenades'
            ],
            [CRAFTERS.Mordekaiser]: ['Overclocked Cogwheel', 'Adjustable Cogwheel'],
            [CRAFTERS.DrMundo]: ['Serrated Cogwheel', 'Impeccable Cogwheel']
        },
        [CATEGORIES.Other]: {
            [CRAFTERS.Rengar]: ['22H Slicks']
        }
    },
    [PROFESSIONS.Inscription]: {
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Sett]: [
                'Contract: Council of Dornogal',
                'Contract: Assembly of the Deeps',
                'Contract: Hallowfall Arathi',
                'Contract: The Severed Threads',
                'Contract: The Cartels of Undermine',
                'Vantus Rune: Nerub-ar Palace',
                'Vantus Rune: Liberation of Undermine',
                'Algari Treatise on Alchemy',
                'Algari Treatise on Blacksmithing',
                'Algari Treatise on Enchanting',
                'Algari Treatise on Engineering',
                'Algari Treatise on Herbalism',
                'Algari Treatise on Inscription',
                'Algari Treatise on Jewelcrafting',
                'Algari Treatise on Leatherworking',
                'Algari Treatise on Mining',
                'Algari Treatise on Skinning',
                'Algari Treatise on Tailoring'
            ],
        },
        [CATEGORIES.Gear]: {
            [CRAFTERS.Volibear]: [
                'Vagabond\'s Bounding Baton',
                'Vagabond\'s Careful Crutch',
                'Vagabond\'s Torch'
            ]
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Ryze]: [
                'Patient Alchemists\'s Mixing Rod',
                'Inscribed Rolling Pin',
                'Silver Tongue\'s Quill'
            ]
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Hotahumm]: ['Shadow Ink', 'Apricate Ink'],
            [CRAFTERS.LeeSin]: ['Codified Greenwood', 'Boundless Cipher'],
            [CRAFTERS.Sett]: [
                'Darkmoon Sigil: Ascension',
                'Darkmoon Sigil: Radiance',
                'Darkmoon Sigil: Symbiosis',
                'Darkmoon Sigil: Vivacity',
                'Algari Missive of the Peerless',
                'Algari Missive of the Quickblade',
                'Algari Missive of the Fireflash',
                'Algari Missive of the Harmonious',
                'Algari Missive of Crafting Speed',
                'Algari Missive of Deftness',
                'Algari Missive of Finesse',
                'Algari Missive of Ingenuity',
                'Algari Missive of Multicraft',
                'Algari Missive of Perception',
                'Algari Missive of Resourcefulness',
                'Algari Missive of the Aurora'
            ]
        }
    },
    [PROFESSIONS.Jewelcrafting]: {
        [CATEGORIES.Gear]: {
            [CRAFTERS.Tyrianth]: [
                'Amulet of Earthen Craftmanship',
                'Binding of Binding',
                'Fractured Gemstone Locket',
                'Ring of Earthen Craftsmanship',
            ]
        },
        [CATEGORIES.GemsTinkers]: {
            [CRAFTERS.Jax]: [
                'Deadly Amber (Stam/Crit)',
                'Masterful Amber (Stam/Mastery)',
                'Quick Amber (Stam/Haste)',
                'Versatile Amber (Stam/Vers)',
                'Deadly Emerald (Haste/Crit)',
                'Masterful Emerald (Haste/Mastery)',
                'Quick Emerald (Haste)',
                'Versatile Emerald (Haste/Vers)',
                'Deadly Ruby (Crit)',
                'Masterful Ruby (Crit/Mastery)',
                'Quick Ruby (Crit/Haste)',
                'Versatile Ruby (Crit/Vers)'
            ],
            [CRAFTERS.Olaf]: [
                'Deadly Onyx (Mastery/Crit)',
                'Masterful Onyx (Mastery)',
                'Quick Onyx (Mastery/Haste)',
                'Versatile Onyx (Mastery/Vers)',
                'Cubic Blasphemia (Primary Stat)',
                'Insightful Blasphemite (Primary Stat/Mana)',
                'Elusive Blasphemite (Primary Stat/Speed)',
                'Culminating Blasphemite (Primary Stat/Crit)',
            ],
            [CRAFTERS.Taric]: [
                'Deadly Sapphire (Vers/Crit)',
                'Masterful Sapphire (Vers/Mastery)',
                'Quick Sapphire (Verse/Haste)',
                'Versatile Sapphire (Vers)'
            ]
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Tyrianth]: [
                'Enchanter\'s Crystal',
                'Extravagant Loupes',
                'Forger\'s Font Inspector',
                'Novelist\'s Specs',
            ]
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Darius]: [
                'Inverted Prism',
                'Decorative Lens',
                'Gilded Vial',
                'Engraved Gemcutter',
                'Marbled Stone',
            ]
        }
    },
    [PROFESSIONS.Leatherworking]: {
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Tyrainth]: [
                'Thunderous Drums',
                'Dual Layered Armor Kit',
                'Charged Armor Kit',
                'Defender\'s Armor Kit',
                'Stormbound Armor Kit',
            ]
        },
        [CATEGORIES.Gear]: {
            [CRAFTERS.Rengar]: ['Smoldering Pollen Hauberk', 'Glyph-Etched Breastplate', 'Glyph-Etched Epaulets', 'Glyph-Etched Guise'],
            [CRAFTERS.Evalynn]: ['Weathered Stormfront Vest', 'Rune-Branded Hood', 'Rune-Branded Mantle', 'Rune-Branded Tunic'],
            [CRAFTERS.Varus]: ['Sanctified Torchbearer\'s Grips', 'Glyph-Etched Gauntlets'],
            [CRAFTERS.Swain]: ['Waders of the Unifying Flame', 'Rune-Branded Kickers', 'Rune-Branded Legwraps'],
            [CRAFTERS.Akali]: ['Adrenal Surge Clasp', /*'Roiling Thunderstrike Talons',*/ 'Rune-Branded Grasps', 'Rune-Branded Waistband'],
            [CRAFTERS.Artamis]: ['Vambraces of Deepening Darkness', 'Glyph-Etched Vambraces'],
            [CRAFTERS.Kindred]: ['Busy Bee\'s Buckle', 'Glyph-Etched Binding'],
            [CRAFTERS.Heimerdinger]: ['Reinforced Setae Flyers', 'Glyph-Etched Cuisses', 'Glyph-Etched Stompers'],
            [CRAFTERS.RekSai]: ['Rook Feather Wristwraps', 'Rune-Branded Armbands']
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Pyke]: [
                'Arathi Leatherworker\'s Smock',
                'Charged Scrapmaster\'s Gauntlets',
                'Deep Tracker\'s Cap',
                'Deep Tracker\'s Pack',
                'Earthen Forgemaster\'s Apron',
                'Earthen Jeweler\'s Cover',
                'Nerubian Alchemist\'s Hat',
                'Stonebound Herbalist\'s Pack',
            ]
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Pyke]: [
                'Carapace-Backed Hide',
                'Chitin Armor Banding',
                'Crystalfused Hide',
                'Leyfused Hide',
                'Sporecoated Hide',
                'Storm-Touched Weapon Wrap',
                'Writhing Hide',
            ],
            [CRAFTERS.Tyrainth]: ['Blessed Weapon Grip', 'Writhing Armor Banding']
        },
    },
    [PROFESSIONS.Tailoring]: {
        [CATEGORIES.Bags]: {
            [CRAFTERS.Lissandra]: [
                'Duskweave Bag',
                'Dawnweave Reagent Bag',
                'Concoctor\'s Clutch',
                'Darkmoon Duffle',
                'Excavator\'s Haversack',
                'Gardener\'s Seed Satchel',
                'Hideseeker\'s Tote',
                'Hideshaper\'s Workbag',
                'Ignition Satchel',
                'Jeweler\'s Purse',
                'Magically "Infinite" Messenger',
                'Prodigy\'s Toolbox',
                'The Severed Satchel'
            ]
        },
        [CATEGORIES.Consumable]: {
            [CRAFTERS.Annie]: ['Weavercloth Bandage'],
            [CRAFTERS.Hera]: ['Algari Weaverline']
        },
        [CATEGORIES.Gear]: {
            [CRAFTERS.Karma]: [
                'Grips of the Woven Dawn',
                'Treads of the Woven Dawn',
                'Gloves of the Woven Dusk',
                'Slippers of the Woven Dusk',
                'Consecrated Gloves',
                'Consecrated Slippers'
            ],
            [CRAFTERS.LeBlanc]: [
                'Warm Sunrise Bracers',
                'Cool Sunset Bracers',
                'Consecrated Cuffs'
            ],
            [CRAFTERS.Lux]: [
                'Consecrated Cloak',
                'Consecrated Hood',
                'Consecrated Leggings',
                'Consecrated Robe'
            ],
            [CRAFTERS.Genianna]: [
                'Consecrated Cord',
                'Consecrated Mantle'
            ]
        },
        [CATEGORIES.ProfessionEquipment]: {
            [CRAFTERS.Lux]: [
                'Artisan Tailor\'s Coat',
                'Artisan Alchemist\'s Robe',
                'Artisan Chef\'s Hat',
                'Artisan Enchanter\'s Hat',
                'Artisan Fishing Cap',
                'Artisan Gardening Hat'
            ]
        },
        [CATEGORIES.Reagent]: {
            [CRAFTERS.Annie]: [
                'Exquisite Weavercloth Bolt',
                'Dawnweave Bolt',
                'Duskweave Bolt',
                'Weavercloth Bolt',
            ],
            [CRAFTERS.Soraka]: [
                'Dawnthread Lining',
                'Duskthread Lining'
            ],
            [CRAFTERS.Lissandra]: [
                'Weavercloth Embroidery Thread',
                'Bright Polishing Cloth',
                'Gritty Polishing Cloth',
                'Preserving Embroidery Thread'
            ],
            [CRAFTERS.Hera]: [
                'Daybreak Spellthread',
                'Sunset Spellthread',
                'Weavercloth Spellthread'
            ]
        }
    }
};

module.exports = {
    PROFESSION_OPTIONS,
    CATEGORY_OPTIONS,
    CRAFTING_MAP
};
