import {Client, GatewayIntentBits, REST} from "discord.js";
import {RoleManager, RoleManagerImpl} from "./manager/roleManager";
import {BotConfig, BotConfigImpl} from "./config/botConfig";
import {RoleRepository, RoleRepositoryImpl} from "./repository/roleRepository";
import {CommandRefresher, CommandRefresherImpl} from "./commands/commandRefresher";
import {ResponseDispatcher, ResponseDispatcherImpl} from "./response/dispatcher";

const config: BotConfig = new BotConfigImpl()

const rest = new REST({version: "10"}).setToken(config.botToken)
const options = {intents: [GatewayIntentBits.Guilds,]}
const client = new Client(options)

const roleRepository: RoleRepository = new RoleRepositoryImpl(config.guildIds)
const roleManager: RoleManager = new RoleManagerImpl(client, roleRepository)

const commandRefresher: CommandRefresher = new CommandRefresherImpl(config, rest)
const responseDispatcher: ResponseDispatcher = new ResponseDispatcherImpl(config, roleRepository, roleManager)

client.once("ready", () => console.debug("ready"))
client.login(config.botToken)
    .then(() => {
        client.on("interactionCreate", async (interaction) => {
            await responseDispatcher.dispatch(interaction)
        })
    })
    .then(() => Promise.all(config.guildIds.map((guild) => commandRefresher.refreshCommands(guild))))
