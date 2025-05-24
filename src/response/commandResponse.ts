import {ChatInputCommandInteraction} from "discord.js";

export interface CommandResponse {
    handle(interaction: ChatInputCommandInteraction): Promise<void>
}
