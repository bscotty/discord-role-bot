import {Bot, BotImpl} from "./bot/bot";
import {BotConfig, BotConfigImpl} from "./bot/botConfig";
import {RoleRepository, RoleRepositoryImpl} from "./repository/roleRepository";
import {ManageRoleCommand} from "./commands/manageRole";
import {RoleCommandController, RoleCommandControllerImpl} from "./commands/roleCommandController";

console.log('Happy developing ✨')

const config: BotConfig = new BotConfigImpl()
const bot: Bot = new BotImpl(config)
const repository: RoleRepository = new RoleRepositoryImpl(config.guildIds)

bot.login()
    .then(async (user) => {
        const controller: RoleCommandController = new RoleCommandControllerImpl(bot, user)
        const commands = [
            new ManageRoleCommand(user, repository, controller)
        ]
        await bot.addCommands(commands)
            .then(async () => {
                await Promise.all(
                    config.guildIds.map(async (guildId) => {
                        const roles = await repository.getRoles(guildId)
                        if (roles.length > 0) {
                            await controller.refreshRoleCommand(guildId, roles)
                        }
                    })
                )
            })
            .catch((it) => console.error(it))
    })
    .catch((it) => console.error(it))
