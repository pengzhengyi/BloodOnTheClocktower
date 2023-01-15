import { DeadReason } from '../deadreason';
import type { Death } from '../death';
import { SlayerNotChoosePlayerToKill } from '../exception';
import type { Player } from '../player';
import type { SlayerPlayer } from '../types';
import { Ability, AbilityUseContext, AbilityUseResult } from './ability';
import {
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
    AbilityUseStatus,
} from './status';
import { GAME_UI } from '~/interaction/gameui';

export interface SlayerAbilityUseResult extends AbilityUseResult {
    chosenPlayer: Player;
    death?: Death;
}

export class SlayerAbility extends Ability<
    AbilityUseContext,
    SlayerAbilityUseResult
> {
    /**
     * {@link `Slayer["ability"]`}
     */
    static readonly description =
        'Once per game, during the day, publicly choose a player: if they are the Demon, they die.';

    protected hasUsedAbility = false;

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

    async isEligible(context: AbilityUseContext): Promise<boolean> {
        return (await super.isEligible(context)) && !this.hasUsedAbility;
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected async attemptToKillDemon(
        player: Player,
        slayerPlayer: Player
    ): Promise<Death | undefined> {
        this.hasUsedAbility = true;
        if (await player.from(slayerPlayer).isTheDemon) {
            return await player.setDead(DeadReason.SlayerKill);
        }
    }

    protected async chooseSuspectedDemon(
        slayerPlayer: SlayerPlayer,
        players: Iterable<Player>,
        context: AbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            slayerPlayer,
            players,
            1,
            SlayerAbility.description
        )) as Player;

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
