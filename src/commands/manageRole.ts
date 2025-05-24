import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from "discord.js";

export const MANAGE_ROLE_COMMAND_NAME = "manage-role"
export const MANAGE_ROLE_OPTION_NAME = "role"

export const ManageRoleCommandBuilder: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName(MANAGE_ROLE_COMMAND_NAME)
    .setDescription("Set a role for me to manage")
    .addRoleOption((option) => option
        .setName(MANAGE_ROLE_OPTION_NAME)
        .setDescription("Choose a role")
        .setRequired(true)
    )
