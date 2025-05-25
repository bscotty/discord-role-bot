import {ManageRoleCommandBuilder} from "./manageRole";
import {RoleCommandBuilder} from "./role";
import {REST, Routes} from "discord.js";
import {BotConfig} from "../config/botConfig";
import {ListRoleCommandBuilder} from "./listRole";

export interface CommandRefresher {
    refreshCommands(guildId: string): Promise<void>
}

export class CommandRefresherImpl implements CommandRefresher {
    constructor(
        private readonly config: BotConfig,
        private readonly rest: REST
    ) {
    }

    async refreshCommands(guildId: string): Promise<void> {
        const commandBuilders = [
            ManageRoleCommandBuilder,
            ListRoleCommandBuilder,
            RoleCommandBuilder
        ]
        const route = Routes.applicationGuildCommands(this.config.botApplicationId, guildId)
        const body = {body: commandBuilders.map((it) => it.toJSON())}
        await this.rest.put(route, body);
        const commandNames = commandBuilders.map((it) => it.name).join(", ");
        console.log(`put commands [${commandNames}] to guild ${guildId}`);
    }
}
