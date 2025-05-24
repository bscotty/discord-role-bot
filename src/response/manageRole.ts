import {CommandResponse} from "./commandResponse";
import {ChatInputCommandInteraction, GuildMember} from "discord.js";
import {MANAGE_ROLE_OPTION_NAME} from "../commands/manageRole";
import {HandleResult} from "../manager/handleResult";
import {RoleManager} from "../manager/roleManager";

export class ManageRoleCommandResponse implements CommandResponse {
    constructor(
        readonly roleManager: RoleManager
    ) {
    }

    async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild
        const role = interaction.options.getRole(MANAGE_ROLE_OPTION_NAME)

        const member = interaction.member
        if (member instanceof GuildMember && !member.permissions.has("Administrator")) {
            await interaction.reply({
                content: `Sorry, only Administrators can tell me to manage roles!`
            })
            return
        }

        if (!await this.roleManager.canManageRole(guild, role.id)) {
            await interaction.reply({
                content: `Sorry, I can't manage the "${role.name}" role. It's higher than my role in the role hierarchy.`
            })
            return
        }

        const result = await this.roleManager.handleRole(guild.id, role.id, role.name)
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
    }
}
