import {
    ChatInputCommandInteraction,
    ClientUser,
    GuildMember,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder
} from "discord.js";
import {BotCommand} from "../bot/botCommand";
import {StorableRole} from "../repository/storableRole";

export const ROLE_COMMAND_NAME = "role"
const ROLE_OPTION_NAME = "role"

export class RoleCommand implements BotCommand {
    readonly name: string;
    readonly description: string;
    readonly builder: SlashCommandOptionsOnlyBuilder;
    readonly clientUser: ClientUser
    readonly guildId: string
    readonly roles: StorableRole[]

    constructor(clientUser: ClientUser, guildId: string, roles: StorableRole[]) {
        this.name = ROLE_COMMAND_NAME
        this.description = "Add or remove a role"
        this.roles = roles
        this.builder = new SlashCommandBuilder()
            .addStringOption((option) => option
                .setName(ROLE_OPTION_NAME)
                .setDescription(this.description)
                .setRequired(true)
                .addChoices(
                    ...this.roles.map((it) => ({name: it.name, value: it.id}))
                )
            )
            .setName(this.name)
            .setDescription(this.description)
        this.clientUser = clientUser
        this.guildId = guildId

    }

    async respondTo(interaction: ChatInputCommandInteraction): Promise<void> {
        const roleId = interaction.options.getString(ROLE_OPTION_NAME)
        const role = this.roles.find((it) => it.id == roleId)

        if (!role) {
            await interaction.reply({content: `I don't know that role, sorry!`, flags: `Ephemeral`})
            return
        }

        const member = interaction.member

        if (role && member instanceof GuildMember) {
            const {isEligible, response} = await this.isEligibleRole(role, interaction)
            if (isEligible) {
                if (member.roles.cache.has(role.id)) {
                    await this.addRoleAndRespond(member, role, interaction)
                } else {
                    await this.removeRoleAndRespond(member, role, interaction)
                }
            } else {
                await interaction.reply({content: response, flags: `Ephemeral`})
            }
        } else {
            await interaction.reply({content: `Something went wrong, sorry!`, flags: `Ephemeral`})
        }
    }

    private async isEligibleRole(role: StorableRole, interaction: ChatInputCommandInteraction): Promise<EligibleRoleResponse> {
        if (interaction.guild.id != this.guildId) {
            return {
                isEligible: false,
                response: `I'm not expecting to get a command from this guild, sorry!`
            }
        }

        const foundRole = this.roles.find(storedRole => storedRole.id == role.id)

        if (!foundRole) {
            return {
                isEligible: false,
                response: `I'm not supposed to manage the ${role.name} role, sorry!`
            }
        }

        const botRole = interaction.guild.roles.botRoleFor(this.clientUser)
        const roleComparison = interaction.guild.roles.comparePositions(botRole, role.id)

        if (roleComparison < 0) {
            return {
                isEligible: false,
                response: `I can't set the "${role.name}" role. It's higher than my role in the role hierarchy.`
            }
        }

        return {isEligible: true, response: ``}
    }

    private async addRoleAndRespond(member: GuildMember, role: StorableRole, interaction: ChatInputCommandInteraction): Promise<void> {
        console.debug(`Member ${member.displayName} already has role ${role.name}, removing`)
        await member.roles.remove(role.id)
            .then(async () => {
                await interaction.reply({content: `Removed role "${role.name}"!`, flags: `Ephemeral`})
            })
            .catch((error => {
                console.log("Failed to remove role", error)
                interaction.reply({content: `Something went wrong, sorry!`, flags: `Ephemeral`})
            }))
    }

    private async removeRoleAndRespond(member: GuildMember, role: StorableRole, interaction: ChatInputCommandInteraction): Promise<void> {
        console.debug(`Member ${member.displayName} does not have role ${role.name}, adding`)
        await member.roles.add(role.id)
            .then(async () => {
                await interaction.reply({content: `Added role "${role.name}"!`, flags: `Ephemeral`})
            })
            .catch((error => {
                console.log("Failed to add role", error)
                interaction.reply({content: `Something went wrong, sorry!`, flags: `Ephemeral`})
            }))
    }
}

type EligibleRoleResponse = {
    isEligible: boolean,
    response: string
}
