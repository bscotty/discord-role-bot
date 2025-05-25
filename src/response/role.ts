import {ChatInputCommandInteraction, GuildMember} from "discord.js";
import {ROLE_OPTION_NAME} from "../commands/role";
import {CommandResponse} from "./commandResponse";
import {RoleRepository} from "../repository/roleRepository";
import {RoleManager} from "../manager/roleManager";

export class RoleCommandResponse implements CommandResponse<ChatInputCommandInteraction> {
    constructor(
        private readonly roleManager: RoleManager,
        private readonly roleRepository: RoleRepository
    ) {
    }

    async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild
        const roleId = interaction.options.getString(ROLE_OPTION_NAME)

        const storedRoles = await this.roleRepository.getRoles(guild.id)
        const foundRole = storedRoles.find((it) => it.id == roleId)
        if (!foundRole) {
            await interaction.reply({content: `I don't know that role, sorry!`})
            return
        }

        if (!await this.roleManager.canManageRole(guild, roleId)) {
            await interaction.reply({
                content: `Sorry, I can't set the "${foundRole.name}" role. It's higher than my role in the role hierarchy.`
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
}
