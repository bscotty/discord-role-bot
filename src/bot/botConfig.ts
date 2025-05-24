import config from "../../bot_config.json"

export interface BotConfig {
    readonly botToken: string
    readonly botApplicationId: string
    readonly guildIds: string[]
}

export class BotConfigImpl implements BotConfig {
    public readonly botToken: string = config.bot_token
    public readonly botApplicationId: string = config.client_id
    public readonly guildIds: string[] = config.guilds
}
