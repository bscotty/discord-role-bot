import {StorableRole} from "./storableRole";
import {JsonFileReader} from "./jsonFileReader";

export interface RoleRepository {
    getRoles(guildId: string): Promise<StorableRole[]>

    addRole(guildId: string, role: StorableRole): Promise<void>

    removeRole(guildId: string, role: StorableRole): Promise<void>
}

export class RoleRepositoryImpl implements RoleRepository {
    private readonly files: { [guildId: string]: JsonFileReader<StorableRole[]> } = {}
    private readonly cache: { [guildId: string]: StorableRole[] } = {}

    constructor(guildIds: string[]) {
        guildIds.forEach((guildId: string) => {
            this.files[guildId] = new JsonFileReader<StorableRole[]>(`/../../../repository/${guildId}.json`)
        })
    }

    async getRoles(guildId: string): Promise<StorableRole[]> {
        const cached = this.cache[guildId]
        if (cached) {
            return cached
        }
        console.debug(`No cache for ${guildId}, reading from file`)

        const fileReader = this.files[guildId]
        if (fileReader) {
            const newCache = fileReader.getJson()
            this.cache[guildId] = newCache
            return newCache
        } else {
            throw Error(`Can't find a cache or file for ${guildId}`)
        }
    }

    async addRole(guildId: string, role: StorableRole): Promise<void> {
        const fileReader: JsonFileReader<StorableRole[]> | undefined = this.files[guildId]
        if (fileReader) {
            fileReader.write([...fileReader.getJson(), role])
            this.cache[guildId] = fileReader.getJson()
        }
    }

    async removeRole(guildId: string, role: StorableRole): Promise<void> {
        const fileReader: JsonFileReader<StorableRole[]> = this.files[guildId]
        if (fileReader) {
            const filtered = fileReader.getJson().filter((it) => it.id != role.id)
            fileReader.write(filtered)
            this.cache[guildId] = fileReader.getJson()
        }
    }
}
