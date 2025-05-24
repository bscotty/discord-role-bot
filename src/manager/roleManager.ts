import {HandleResult} from "./handleResult";
import {RoleRepository} from "../repository/roleRepository";
import {StorableRole} from "../repository/storableRole";

export interface RoleManager {
    handleRole(guildId: string, id: string, name: string): Promise<HandleResult>
}

export class RoleManagerImpl implements RoleManager {
    constructor(
        readonly repository: RoleRepository
    ) {
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
