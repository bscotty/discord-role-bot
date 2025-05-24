export class StorableRole {
    readonly id: string;
    readonly name: string;

    constructor(
        id: string,
        name: string,
    ) {
        this.id = id;
        this.name = name;
    }
}

export class KeyedStorableRole {
    readonly guildId: string;
    readonly storableRole: StorableRole;

    constructor(guildId: string, roleId: string, roleName: string) {
        this.guildId = guildId;
        this.storableRole = new StorableRole(roleId, roleName);
    }
}
