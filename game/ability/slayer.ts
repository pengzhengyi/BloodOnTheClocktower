import { DeadReason } from '../dead-reason';
import type { Death } from '../death';
import { SlayerNotChoosePlayerToKill } from '../exception';
import type { IPlayer } from '../player';
import type { SlayerPlayer } from '../types';
import { Ability, AbilityUseContext, AbilityUseResult, Once } from './ability';
import {
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
    AbilityUseStatus,
} from './status';
import { Environment } from '~/interaction/environment';

export interface SlayerAbilityUseResult extends AbilityUseResult {
    chosenPlayer: IPlayer;
    death?: Death;
}

class BaseSlayerAbility extends Ability<
    AbilityUseContext,
    SlayerAbilityUseResult
> {
    /**
     * {@link `Slayer["ability"]`}
     */
    static readonly description =
        'Once per game, during the day, publicly choose a player: if they are the Demon, they die.';

    declare hasUsedAbility: boolean;

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<SlayerAbilityUseResult> {
        const chosenPlayer = await this.chooseSuspectedDemon(
            context.requestedPlayer,
            context.players,
            context
        );

        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            chosenPlayer,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<SlayerAbilityUseResult> {
        const chosenPlayer = await this.chooseSuspectedDemon(
            context.requestedPlayer,
            context.players,
            context
        );
        const death = await this.attemptToKillDemon(
            chosenPlayer,
            context.requestedPlayer
        );

        return Promise.resolve({
            status:
                death === undefined
                    ? AbilityUseStatus.Success
                    : AbilitySuccessUseWhenHasEffect,
            chosenPlayer,
            death,
            description: this.formatDescriptionForNormal(context),
        });
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected async attemptToKillDemon(
        player: IPlayer,
        slayerPlayer: IPlayer
    ): Promise<Death | undefined> {
        if (await player.from(slayerPlayer).isTheDemon) {
            return await player.setDead(DeadReason.SlayerKill);
        }
    }

    protected async chooseSuspectedDemon(
        slayerPlayer: SlayerPlayer,
        players: Iterable<IPlayer>,
        context: AbilityUseContext
    ): Promise<IPlayer> {
        let chosen = (await Environment.current.gameUI.choose(
            slayerPlayer,
            players,
            1,
            BaseSlayerAbility.description
        )) as IPlayer;

        if (chosen === undefined) {
            const error = new SlayerNotChoosePlayerToKill(
                slayerPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedPlayerToKill;
        }

        return chosen;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Slayer player ${context.requestedPlayer} can not kill the demon when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `Slayer player ${context.requestedPlayer} may inadvertently execute their accuser`;
    }
}

export interface SlayerAbility
    extends Ability<AbilityUseContext, SlayerAbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SlayerAbility = Once(BaseSlayerAbility);
