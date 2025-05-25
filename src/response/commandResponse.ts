import {BaseInteraction} from "discord.js";

export interface CommandResponse<Interaction extends BaseInteraction> {
    handle(interaction: Interaction): Promise<void>
}
