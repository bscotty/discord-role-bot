import {BaseInteraction} from "discord.js";

export interface CommandResponse {
    handle(interaction: BaseInteraction): Promise<void>
}
