import {AutocompleteInteraction, BaseInteraction, ChatInputCommandInteraction} from "discord.js";
import {RoleRepository} from "../repository/roleRepository";
import {RoleManager} from "../manager/roleManager";
import {CommandResponse} from "./commandResponse";
import {ROLE_COMMAND_NAME} from "../commands/role";
import {RoleAutoCompleteCommandResponse} from "./roleAutocomplete";
import {RoleCommandResponse} from "./role";
import {MANAGE_ROLE_COMMAND_NAME} from "../commands/manageRole";
import {ManageRoleCommandResponse} from "./manageRole";
import {LIST_ROLE_COMMAND_NAME} from "../commands/listRole";
import {ListRoleCommandResponse} from "./listRole";
import {BotConfig} from "../config/botConfig";

export interface ResponseDispatcher {
    dispatch(baseInteraction: BaseInteraction): Promise<void>
}

export class ResponseDispatcherImpl implements ResponseDispatcher {
    autoCompleteCommands: { [commandName: string]: CommandResponse<AutocompleteInteraction> } = {}
    chatCommands: { [commandName: string]: CommandResponse<ChatInputCommandInteraction> } = {}

    constructor(
        private readonly config: BotConfig,
        private readonly roleRepository: RoleRepository,
        private readonly roleManager: RoleManager
    ) {
        this.autoCompleteCommands[ROLE_COMMAND_NAME] = new RoleAutoCompleteCommandResponse(this.roleRepository)

        this.chatCommands[ROLE_COMMAND_NAME] = new RoleCommandResponse(this.roleManager, this.roleRepository)
        this.chatCommands[MANAGE_ROLE_COMMAND_NAME] = new ManageRoleCommandResponse(this.roleManager)
        this.chatCommands[LIST_ROLE_COMMAND_NAME] = new ListRoleCommandResponse(this.roleRepository)
    }

    dispatch(interaction: BaseInteraction): Promise<void> {
        if (!this.config.guildIds.includes(`${interaction.guild.id}`)) {
            console.warn(`Ignoring command from unknown guild: ${interaction.guild.id} - ${interaction.guild.name}`)
            return
        }

        if (interaction.isAutocomplete()) {
            return this.dispatchAutocomplete(interaction)
        } else if (interaction.isChatInputCommand()) {
            return this.dispatchChatCommand(interaction)
        }
    }

    private async dispatchAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const commandName = interaction.commandName
        const response = this.autoCompleteCommands[commandName]
        if (response) {
            try {
                await response.handle(interaction)
            } catch (e) {
                console.error(`Could not dispatch autocomplete`, e)
            }
        } else {
            console.warn(`Ignoring unknown autocomplete command ${commandName}`)
        }
    }

    private async dispatchChatCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const commandName = interaction.commandName
        const response = this.chatCommands[commandName]
        if (response) {
            try {
                await response.handle(interaction)
            } catch (e) {
                console.error(`Could not dispatch chat command`, e)
                await interaction.reply({content: `Something went wrong, sorry!`, flags: `Ephemeral`});
            }
        } else {
            console.warn(`Ignoring unknown chat command ${commandName}`)
        }
    }

}
