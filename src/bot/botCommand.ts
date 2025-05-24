import {ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder} from "discord.js";

export interface BotCommand {
    readonly name: string
    readonly builder: SlashCommandOptionsOnlyBuilder

    respondTo(interaction: ChatInputCommandInteraction): Promise<void>
}
