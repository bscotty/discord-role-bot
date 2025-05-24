import {Client, ClientUser, GatewayIntentBits, REST, Routes, SlashCommandOptionsOnlyBuilder} from "discord.js";
import {BotConfig} from "./botConfig"
import {BotCommand} from "./botCommand";
import {ROLE_COMMAND_NAME, RoleCommand} from "../commands/role";

export interface Bot {
    login(): Promise<ClientUser>

    addCommands(interactionCreateCommands: BotCommand[]): Promise<void>

    refreshCommand(guildId: string, command: RoleCommand): Promise<void>
}

export class BotImpl implements Bot {
    protected readonly client: Client
    protected readonly rest: REST
    protected readonly config: BotConfig
    protected roleCommandMap: { [guildId: string]: RoleCommand } = {}
    protected sharedCommands: BotCommand[] = []

    constructor(config: BotConfig) {
        this.config = config
        const options = {
            intents: [
                GatewayIntentBits.Guilds,
            ]
        }
        this.rest = new REST({version: "10"}).setToken(this.config.botToken)
        this.client = new Client(options)
        this.client.once("ready", () => {
            console.log("ready")
        })
    }

    public async login(): Promise<ClientUser> {
        return await this.client.login(this.config.botToken)
            .then(() => console.log("logged in"))
            .then(() => this.client.user)
            .then((it) => {
                this.listenForCommands()
                return it
            })
    }

    public async addCommands(interactionCreateCommands: BotCommand[]) {
        // await this.registerCommands(interactionCreateCommands.map((it) => it.builder))

        // if (interactionCreateCommands.length == 0)
        //     throw Error("Empty slash command list")
        this.sharedCommands.push(...interactionCreateCommands)
    }

    public async refreshCommand(guildId: string, command: RoleCommand): Promise<void> {
        const route = Routes.applicationGuildCommands(this.config.botApplicationId, guildId)
        const commands = [...this.sharedCommands, command]
        const body = {body: commands.map((it) => it.builder.toJSON())}
        await this.rest.put(route, body)
            .then(() => console.log(`commands [${commands.map((it) => it.name).join(", ")}] refreshed to guild ${guildId}`))
            .then(() => {
                this.roleCommandMap[guildId] = command
            })
            .catch(reason => console.error(`Failed to register command ${command.name} to guild ${guildId}`, reason))
    }

    private async registerCommands(commands: SlashCommandOptionsOnlyBuilder[]) {
        const requests: Promise<void>[] = this.config.guildIds.map(async (guild: string) => {
            const route = Routes.applicationGuildCommands(this.config.botApplicationId, guild)
            const body = {body: commands.map((it) => it.toJSON())}
            await this.rest.put(route, body)
                .then(() => {
                    const commandNames = commands.map((it) => it.name).join(", ")
                    console.log(`put commands [${commandNames}] to guild ${guild}`)
                })
        })
        await Promise.all(requests)
            .then(() => console.log("all commands registered"))
            .catch((reason) => console.error(reason))
    }

    private listenForCommands() {
        this.client.on("interactionCreate", async interaction => {
            if (!interaction.isChatInputCommand()) return;
            if (!this.config.guildIds.includes(`${interaction.guild.id}`)) {
                console.warn(`Ignoring command from unknown guild: ${interaction.guild.id} - ${interaction.guild.name}`)
                return
            }

            const {commandName} = interaction

            if (commandName == ROLE_COMMAND_NAME) {
                const command = this.roleCommandMap[interaction.guild.id]
                if (command) {
                    try {
                        await command.respondTo(interaction)
                    } catch (e) {
                        console.error(e)
                    }
                }
            } else {
                const command = this.sharedCommands.find((it) => it.name == commandName)
                if (command) {
                    try {
                        await command.respondTo(interaction)
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        })
    }
}
