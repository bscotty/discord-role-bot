import {HandleResult} from "./handleResult";
import {RoleRepository} from "../repository/roleRepository";
import {StorableRole} from "../repository/storableRole";
import {Client, Guild} from "discord.js";

export interface RoleManager {
    canManageRole(guild: Guild, roleId: string): Promise<boolean>

    handleRole(guildId: string, id: string, name: string): Promise<HandleResult>
}

export class RoleManagerImpl implements RoleManager {
    constructor(
        readonly client: Client,
        readonly repository: RoleRepository
    ) {
    }

    async canManageRole(guild: Guild, roleId: string): Promise<boolean> {
        const botRole = guild.roles.botRoleFor(this.client.user)
        const roleComparison = guild.roles.comparePositions(botRole, roleId)
        return roleComparison > 0
    }

    async handleRole(guildId: string, id: string, name: string): Promise<HandleResult> {
        const role = new StorableRole(id, name)
        const currentRoles = await this.repository.getRoles(guildId)
        const foundRole = currentRoles.find((it) => it.id == id)

        if (foundRole) {
            if (foundRole.name != name) {
                await this.repository.removeRole(guildId, role)
                await this.repository.addRole(guildId, role)
                return HandleResult.Replaced
            } else {
                await this.repository.removeRole(guildId, role)
                return HandleResult.Deleted
            }
        } else {
            await this.repository.addRole(guildId, role)
            return HandleResult.Added
        }
    }
}
