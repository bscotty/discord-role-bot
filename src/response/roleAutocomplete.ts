import {CommandResponse} from "./commandResponse";
import {AutocompleteInteraction} from "discord.js";
import {RoleRepository} from "../repository/roleRepository";

export class RoleAutocompleteCommandResponse implements CommandResponse {
    constructor(
        readonly roleRepository: RoleRepository
    ) {
    }

    async handle(interaction: AutocompleteInteraction): Promise<void> {
        const focusedValue = interaction.options.getFocused().toLowerCase()
        const roles = await this.roleRepository.getRoles(interaction.guild.id)
        const filtered = roles.filter((it) => it.name.toLowerCase().includes(focusedValue))
        filtered.length = Math.min(25, filtered.length)
        await interaction.respond(filtered.map((it) => ({name: it.name, value: it.id})))
    }
}