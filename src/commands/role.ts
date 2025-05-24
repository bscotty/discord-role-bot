import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from "discord.js";
import {StorableRole} from "../repository/storableRole";

export const ROLE_COMMAND_NAME = "role"
export const ROLE_OPTION_NAME = "role"

export function getRoleCommandBuilder(roles: StorableRole[]): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName(ROLE_COMMAND_NAME)
        .setDescription("Add or remove a role")
        .addStringOption((option) => option
            .setName(ROLE_OPTION_NAME)
            .setDescription("Choose a role")
            .setRequired(true)
            .addChoices(
                ...roles.map((it) => ({name: it.name, value: it.id}))
            )
        )
}
