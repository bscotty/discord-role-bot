import {BotCommand} from "../bot/botCommand";
import {ChatInputCommandInteraction, ClientUser, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from "discord.js";
import {RoleRepository} from "../repository/roleRepository";
import {KeyedStorableRole} from "../repository/storableRole";
import {RoleCommandController} from "./roleCommandController";

const MANAGE_ROLE_OPTION_NAME = "role"

export class ManageRoleCommand implements BotCommand {
    readonly name: string;
    readonly description: string;
    readonly builder: SlashCommandOptionsOnlyBuilder;
    readonly user: ClientUser;
    readonly repository: RoleRepository;
    readonly roleCommandController: RoleCommandController;

    constructor(user: ClientUser, repository: RoleRepository, roleCommandController: RoleCommandController) {
        this.name = "manage-role";
        this.description = "Set a role for me to manage"
        this.builder = new SlashCommandBuilder()
            .addRoleOption((option) => option
                .setName(MANAGE_ROLE_OPTION_NAME)
                .setDescription("Choose a role")
                .setRequired(true)
            )
            .setName(this.name)
            .setDescription(this.description)
        this.user = user;
        this.repository = repository
        this.roleCommandController = roleCommandController
    }

    async respondTo(interaction: ChatInputCommandInteraction): Promise<void> {
        const role = interaction.options.getRole(MANAGE_ROLE_OPTION_NAME)
        const botRole = interaction.guild.roles.botRoleFor(this.user)
        const roleComparison = interaction.guild.roles.comparePositions(botRole, role.id)

        if (roleComparison < 0) {
            await interaction.reply({
                content: `I can't manage the "${role.name}" role. It's higher than my role in the role hierarchy.`,
                flags: `Ephemeral`
            })
            return
        }

        const storableRole = new KeyedStorableRole(interaction.guild.id, role.id, role.name)
        const hasRole = await this.repository.hasRole(storableRole)
        if (hasRole) {
            return this.repository.removeRole(storableRole)
                .then(async (roles) => {
                    await interaction.reply({content: `Got it, I won't manage the "${role.name}" role from now on!`})
                    return roles
                })
                .then(async (roles) => {
                    await this.roleCommandController.refreshRoleCommand(interaction.guild.id, roles)
                })
                .catch(async (error) => {
                    console.error(`Failed to remove role ${role.name}`, error)
                    await interaction.reply({content: `Something went wrong, sorry!`})
                })
        } else {
            return this.repository.addRole(storableRole)
                .then(async (roles) => {
                    await interaction.reply({content: `Got it, I'll manage the "${role.name}" role from now on!`})
                    return roles
                })
                .then(async (roles) => {
                    await this.roleCommandController.refreshRoleCommand(interaction.guild.id, roles)
                })
                .catch(async (error) => {
                    console.error(`Failed to add role ${role.name}`, error)
                    await interaction.reply({content: `Something went wrong, sorry!`})
                })
        }
    }
}