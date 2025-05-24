import {ManageRoleCommandBuilder} from "./manageRole";
import {getRoleCommandBuilder} from "./role";
import {REST, Routes} from "discord.js";
import {RoleRepository} from "../repository/roleRepository";
import {BotConfig} from "../config/botConfig";

export interface CommandRefresher {
    refreshCommands(guildId: string): Promise<void>
}

export class CommandRefresherImpl implements CommandRefresher {
    constructor(
        readonly config: BotConfig,
        readonly rest: REST,
        readonly roleRepository: RoleRepository,
    ) {
    }

    async refreshCommands(guildId: string): Promise<void> {
        const roles = await this.roleRepository.getRoles(guildId)
        const commandBuilders = [ManageRoleCommandBuilder, getRoleCommandBuilder(roles)]
        const route = Routes.applicationGuildCommands(this.config.botApplicationId, guildId)
        const body = {body: commandBuilders.map((it) => it.toJSON())}
        await this.rest.put(route, body);
        const commandNames = commandBuilders.map((it) => it.name).join(", ");
        console.log(`put commands [${commandNames}] to guild ${guildId}`);
    }
}
