import {StorableRole} from "./storableRole";
import {JsonFileReader} from "./jsonFileReader";

export interface RoleRepository {
    getRoles(guildId: string): Promise<StorableRole[]>

    addRole(guildId: string, role: StorableRole): Promise<StorableRole[]>

    removeRole(guildId: string, role: StorableRole): Promise<StorableRole[]>
}

export class RoleRepositoryImpl implements RoleRepository {
    readonly files: { [guildId: string]: JsonFileReader<StorableRole[]> } = {}

    constructor(guildIds: string[]) {
        guildIds.forEach((guildId: string) => {
            this.files[guildId] = new JsonFileReader<StorableRole[]>(`/../../../repository/${guildId}.json`)
        })
    }

    async getRoles(guildId: string): Promise<StorableRole[]> {
        const fileReader = this.files[guildId]
        if (fileReader) {
            return fileReader.getJson()
        } else {
            return []
        }
    }

    async addRole(guildId: string, role: StorableRole): Promise<StorableRole[]> {
        const fileReader: JsonFileReader<StorableRole[]> | undefined = this.files[guildId]
        if (fileReader) {
            fileReader.write([...fileReader.getJson(), role])
            return fileReader.getJson()
        } else {
            throw new Error(`Cannot store role with guild id ${guildId}`)
        }
    }

    async removeRole(guildId: string, role: StorableRole): Promise<StorableRole[]> {
        const fileReader: JsonFileReader<StorableRole[]> = this.files[guildId]
        if (fileReader) {
            const filtered = fileReader.getJson().filter((it) => it.id != role.id)
            fileReader.write(filtered)
            return fileReader.getJson()
        } else {
            throw new Error(`Cannot remove role with guild id ${guildId}`)
        }
    }
}
