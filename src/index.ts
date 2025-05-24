import {ChatInputCommandInteraction, Client, GatewayIntentBits, Guild, GuildMember, REST} from "discord.js";
import {RoleManager, RoleManagerImpl} from "./manager/roleManager";
import {HandleResult} from "./manager/handleResult";
import {BotConfig, BotConfigImpl} from "./config/botConfig";
import {RoleRepository, RoleRepositoryImpl} from "./repository/roleRepository";
import {MANAGE_ROLE_COMMAND_NAME, MANAGE_ROLE_OPTION_NAME} from "./commands/manageRole";
import {ROLE_COMMAND_NAME, ROLE_OPTION_NAME} from "./commands/role";
import {CommandRefresher, CommandRefresherImpl} from "./commands/commandRefresher";

const config: BotConfig = new BotConfigImpl()

// region Discord Stuff
const rest = new REST({version: "10"}).setToken(config.botToken)
const options = {intents: [GatewayIntentBits.Guilds,]}
const client = new Client(options)

function isManageableRole(roleId: string, guild: Guild): boolean {
    const botRole = guild.roles.botRoleFor(client.user)
    const roleComparison = guild.roles.comparePositions(botRole, roleId)
    return roleComparison > 0
}

// endregion Discord Stuff

// region Repository Stuff
const roleRepository: RoleRepository = new RoleRepositoryImpl(config.guildIds)
const roleManager: RoleManager = new RoleManagerImpl(roleRepository)
const commandRefresher: CommandRefresher = new CommandRefresherImpl(config, rest, roleRepository)
// endregion Repository Stuff

// region Functional Stuff

async function handleRole(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild
    const roleId = interaction.options.getString(ROLE_OPTION_NAME)

    const storedRoles = await roleRepository.getRoles(guild.id)
    const foundRole = storedRoles.find((it) => it.id == roleId)
    if (!foundRole) {
        await interaction.reply({content: `I don't know that role, sorry!`})
        return
    }

    if (!isManageableRole(roleId, guild)) {
        await interaction.reply({
            content: `I can't set the "${foundRole.name}" role. It's higher than my role in the role hierarchy.`
        })
        return
    }
    const member = interaction.member
    if (member instanceof GuildMember) {
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId)
            await interaction.reply({content: `Removed role "${foundRole.name}"!`, flags: `Ephemeral`})
        } else {
            await member.roles.add(roleId)
            await interaction.reply({content: `Added role "${foundRole.name}"!`, flags: `Ephemeral`})
        }
    } else {
        await interaction.reply({content: `Something went wrong, sorry!`, flags: `Ephemeral`})
    }
}

async function handleManageRole(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild
    const role = interaction.options.getRole(MANAGE_ROLE_OPTION_NAME)

    const member = interaction.member
    if (member instanceof GuildMember && !member.permissions.has("Administrator")) {
        await interaction.reply({
            content: `Sorry, only Administrators can tell me to manage roles!`
        })
        return
    }

    if (!isManageableRole(role.id, guild)) {
        await interaction.reply({
            content: `I can't manage the "${role.name}" role. It's higher than my role in the role hierarchy.`
        })
        return
    }

    const result = await roleManager.handleRole(guild.id, role.id, role.name)
    switch (result) {
        case HandleResult.Added:
            await interaction.reply({content: `Got it, I'll manage the "${role.name}" role from now on!`})
            break
        case HandleResult.Deleted:
            await interaction.reply({content: `Got it, I won't manage the "${role.name}" role from now on!`})
            break
        case HandleResult.Replaced:
            await interaction.reply({content: `Got it, I'll manage the "${role.name}" role from now on!`})
            break
    }
    await commandRefresher.refreshCommands(guild.id)
}

client.once("ready", () => console.log("ready"))
client.login(config.botToken)
    .then(() => {
        client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (!config.guildIds.includes(`${interaction.guild.id}`)) {
                console.warn(`Ignoring command from unknown guild: ${interaction.guild.id} - ${interaction.guild.name}`)
                return
            }
            console.log(`got command ${interaction.commandName}`)
            const {commandName} = interaction
            switch (commandName) {
                case ROLE_COMMAND_NAME:
                    await handleRole(interaction)
                    break;
                case MANAGE_ROLE_COMMAND_NAME:
                    await handleManageRole(interaction)
                    break;
                default:
                    console.error(`Unknown command name ${commandName}`)
                    break;
            }
        })
    })
    .then(() => Promise.all(config.guildIds.map((guild) => commandRefresher.refreshCommands(guild))))

// endregion Functional Stuff
