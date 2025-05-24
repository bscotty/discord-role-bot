import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from "discord.js";

export const LIST_ROLE_COMMAND_NAME = "list-roles"

export const ListRoleCommandBuilder: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName(LIST_ROLE_COMMAND_NAME)
    .setDescription("List the roles I to manage")
