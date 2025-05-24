import {Client, GatewayIntentBits, REST} from "discord.js";
import {RoleManager, RoleManagerImpl} from "./manager/roleManager";
import {BotConfig, BotConfigImpl} from "./config/botConfig";
import {RoleRepository, RoleRepositoryImpl} from "./repository/roleRepository";
import {MANAGE_ROLE_COMMAND_NAME} from "./commands/manageRole";
import {ROLE_COMMAND_NAME} from "./commands/role";
import {CommandRefresher, CommandRefresherImpl} from "./commands/commandRefresher";
import {RoleCommandResponse} from "./response/role";
import {ManageRoleCommandResponse} from "./response/manageRole";
import {ListRoleCommandResponse} from "./response/listRole";
import {LIST_ROLE_COMMAND_NAME} from "./commands/listRole";
import {RoleAutocompleteCommandResponse} from "./response/roleAutocomplete";

const config: BotConfig = new BotConfigImpl()

const rest = new REST({version: "10"}).setToken(config.botToken)
const options = {intents: [GatewayIntentBits.Guilds,]}
const client = new Client(options)

const roleRepository: RoleRepository = new RoleRepositoryImpl(config.guildIds)
const roleManager: RoleManager = new RoleManagerImpl(client, roleRepository)
const commandRefresher: CommandRefresher = new CommandRefresherImpl(config, rest)

const roleCommandResponse = new RoleCommandResponse(roleManager, roleRepository)
const roleAutoCompleteCommandResponse = new RoleAutocompleteCommandResponse(roleRepository)
const manageRoleCommandResponse = new ManageRoleCommandResponse(roleManager)
const listRoleCommandResponse = new ListRoleCommandResponse(roleRepository)

client.once("ready", () => console.log("ready"))
client.login(config.botToken)
    .then(() => {
        client.on("interactionCreate", async (interaction) => {
            if (interaction.isAutocomplete() && interaction.commandName == ROLE_COMMAND_NAME) {
                await roleAutoCompleteCommandResponse.handle(interaction)
                return
            }
            if (!interaction.isChatInputCommand()) return;
            if (!config.guildIds.includes(`${interaction.guild.id}`)) {
                console.warn(`Ignoring command from unknown guild: ${interaction.guild.id} - ${interaction.guild.name}`)
                return
            }
            console.log(`got command ${interaction.commandName}`)
            const {commandName} = interaction
            switch (commandName) {
                case ROLE_COMMAND_NAME:
                    await roleCommandResponse.handle(interaction)
                    break;
                case LIST_ROLE_COMMAND_NAME:
                    await listRoleCommandResponse.handle(interaction)
                    break;
                case MANAGE_ROLE_COMMAND_NAME:
                    await manageRoleCommandResponse.handle(interaction)
                    break;
                default:
                    console.error(`Unknown command name ${commandName}`)
                    break;
            }
        })
    })
    .then(() => Promise.all(config.guildIds.map((guild) => commandRefresher.refreshCommands(guild))))
