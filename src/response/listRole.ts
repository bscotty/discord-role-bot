import {CommandResponse} from "./commandResponse";
import {RoleRepository} from "../repository/roleRepository";
import {ChatInputCommandInteraction} from "discord.js";

export class ListRoleCommandResponse implements CommandResponse<ChatInputCommandInteraction> {
    constructor(
        private readonly roleRepository: RoleRepository
    ) {
    }

    async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guild.id
        const roles = await this.roleRepository.getRoles(guildId)
        const roleNames = roles.map((it) => it.name)
        const response = `Here are all the roles I manage in this server: ${roleNames.map((it) => `\n* ${it}`).join()}`

        await interaction.reply({content: response, flags: `Ephemeral`})
    }
}
