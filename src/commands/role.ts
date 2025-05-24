import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from "discord.js";

export const ROLE_COMMAND_NAME = "role"
export const ROLE_OPTION_NAME = "role"

export const RoleCommandBuilder: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName(ROLE_COMMAND_NAME)
    .setDescription("Add or remove a role")
    .addStringOption((option) => option
        .setName(ROLE_OPTION_NAME)
        .setDescription("Choose a role")
        .setRequired(true)
        .setAutocomplete(true)
    )
