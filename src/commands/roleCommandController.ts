import {StorableRole} from "../repository/storableRole";
import {Bot} from "../bot/bot";
import {ClientUser} from "discord.js";
import {RoleCommand} from "./role";

export interface RoleCommandController {
    refreshRoleCommand(guildId: string, roles: StorableRole[]): Promise<void>
}

export class RoleCommandControllerImpl implements RoleCommandController {
    private readonly bot: Bot
    private readonly user: ClientUser

    constructor(
        bot: Bot,
        user: ClientUser,
    ) {
        this.bot = bot
        this.user = user
    }

    async refreshRoleCommand(guildId: string, roles: StorableRole[]): Promise<void> {
        console.log("Refreshing role command...")
        await this.bot.refreshCommand(guildId, new RoleCommand(this.user, guildId, roles))
    }
}
