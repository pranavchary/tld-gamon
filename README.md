# Gamon
**Gamon \<Hero of Orgrimmar\>** is a Tauren Warrior NPC located in Valley of Strength within the city of Orgrimmar.

Just kidding.

Gamon is a Discord bot that can simulate and predict how completing Mythic+ dungeons at certain keystone levels might impact a character's Mythic+ rating. This bot is based on [Mythic Rating Helper](https://github.com/Coryrin/mr-helper) and has been modified to work within the Discord server for the World of Warcraft guild The Last Dynasty (US - Thrall).

With the changes to Mythic+ dungeons and scoring that came along with The War Within, the new calculation formulas are based on [Rating Calculator](https://github.com/SamFarah/RatingCalculator) which is available in web browsers at https://www.mythicplanner.com.

What Gamon can do for you:
- Simulate a character running all Mythic+ dungeons at a single keystone level
- Tell which dungeons a character could run and time to slightly improve their Mythic+ rating
- Provide a plan for dungeons a character can complete to reach a goal Mythic+ rating

Currently, Gamon can calculate scores for Mythic+ dungeons up to +30.

*Last update: Midnight Season 2*

## The Last Dynasty Links
- [Raider.io](https://raider.io/guilds/us/thrall/The%20Last%20Dynasty)
- [Warcraft Logs](https://www.warcraftlogs.com/guild/us/thrall/the%20last%20dynasty)
- [WoW Armory](https://worldofwarcraft.blizzard.com/en-us/guild/us/thrall/the-last-dynasty)

## Local Setup

**Prerequisites:** Node.js 20.x

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy the env template and fill in your values:
   ```bash
   cp .env.template .env

   ```
   
   The bot requires that the server have 3 custom emojis named `gamon_shout`, `storm_bolt`, and `gorehowl`. Those emoji IDs should be used in environment variable values as defined below:
   | Variable | Purpose |
   |----------|---------|
   | `BOT_TOKEN` | Discord bot token |
   | `BOT_CLIENT_ID` | Discord application (client) ID |
   | `GAMON_SHOUT_ID` | Custom emoji ID used in shout responses |
   | `STORM_BOLT_ID` | Custom emoji ID used in shout responses |
   | `GOREHOWL_ID` | Custom emoji ID used in shout responses |
3. Register the slash commands with Discord:
   ```bash
   npm run cmds
   ```
4. Run the bot:
   ```bash
   npm run dev # Starts a nodemon server that hot-reloads when a file change is detected
   ```

## Commands

All functionality lives under the `/gamon` slash command. Required inputs are collected through Discord's guided prompts. For calculation commands, if no realm is given, Gamon searches **Thrall**.

| Command | Description | Options |
|---------|-------------|---------|
| `/gamon simulate` | Simulate running every dungeon at one keystone level | `character`\*, `level`\*, `realm`, `alphabetical` |
| `/gamon push` | Find dungeons you can time to gain rating with relative ease | `character`\*, `realm`, `alphabetical` |
| `/gamon goal` | Get a plan of dungeons to reach a target rating | `character`\*, `rating`\*, `realm`, `sort` (alphabetical \| level) |
| `/gamon help` | Explain what Gamon can do | — |
| `/gamon says` | A private quote from the Hero of Orgrimmar | — |
| `/gamon shouts` | Rally the channel with a Gamon shout | — |
| `/gamon butts` | Do it… I dare you | — |

\* = required
