import {KeyedStorableRole, StorableRole} from "./storableRole";
import fs from "fs";

export interface RoleRepository {
    getRoles(guildId: string): Promise<StorableRole[]>

    hasRole(role: KeyedStorableRole): Promise<boolean>;

    addRole(role: KeyedStorableRole): Promise<StorableRole[]>

    removeRole(role: KeyedStorableRole): Promise<StorableRole[]>
}

export class RoleRepositoryImpl implements RoleRepository {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    async hasRole(role: KeyedStorableRole): Promise<boolean> {
        const fileReader = this.files[role.guildId]
        if (fileReader) {
            const foundRole = fileReader.getJson()
                .find((it) => it.id == role.storableRole.id && it.name == role.storableRole.name)
            return !!foundRole;
        } else {
            console.error(`Cannot check for role with guild id ${role.guildId}`)
            return false
        }
    }

    async addRole(role: KeyedStorableRole): Promise<StorableRole[]> {
        const fileReader: JsonFileReader<StorableRole[]> | undefined = this.files[role.guildId]
        if (fileReader) {
            fileReader.write(
                [
                    ...fileReader.getJson().filter((it) => it.id == role.storableRole.id),
                    role.storableRole
                ]
            )
            return fileReader.getJson()
        } else {
            throw new Error(`Cannot store role with guild id ${role.guildId}`)
        }
    }

    async removeRole(role: KeyedStorableRole): Promise<StorableRole[]> {
        const fileReader: JsonFileReader<StorableRole[]> = this.files[role.guildId]
        if (fileReader) {
            const filtered = fileReader.getJson().filter((it) => it.id != role.storableRole.id)
            fileReader.write(filtered)
            return fileReader.getJson()
        } else {
            throw new Error(`Cannot remove role with guild id ${role.guildId}`)
        }
    }
}

class JsonFileReader<T> {
    readonly path: string

    constructor(path: string) {
        this.path = path
        const file = this.file()

        if (!fs.existsSync(file)) {
            console.debug(`file does not exist at path ${path}`)
            fs.openSync(file, "w")
            fs.writeFileSync(file, "[]")
        } else {
            console.debug(`file exists at path ${path}, doing nothing`)
        }
    }

    write(input: T) {
        fs.writeFileSync(this.file(), JSON.stringify(input, null, 2))
    }

    getJson(): T {
        const string = fs.readFileSync(this.file(), {encoding: "utf8"})
        return JSON.parse(string)
    }

    private file(): string {
        return __dirname + this.path
    }
}
