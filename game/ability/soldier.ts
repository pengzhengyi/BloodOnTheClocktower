import type { InteractionContext } from '../effect/effect';
import { SafeFromDemonEffect } from '../effect/safe-from-demon';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import type { SoldierPlayer } from '../types';
import {
    Ability,
    type AbilityUseContext,
    type AbilityUseResult,
    type AbilitySetupContext,
    RequireSetup,
} from './ability';
import {
    AbilitySuccessUseWhenMalfunction,
    AbilitySuccessUseWhenHasEffect,
} from './status';

export class SoldierSafeFromDemonEffect extends SafeFromDemonEffect<SoldierPlayer> {
    static readonly description = 'The Soldier can not be killed by the Demon.';

    isApplicable(context: InteractionContext<SoldierPlayer>): boolean {
        return super.isApplicable(context) && this.isTargetHasAbility(context);
    }
}

class BaseSoldierAbility extends Ability<AbilityUseContext, AbilityUseResult> {
    /**
     * {@link `Soldier["ability"]`}
     */
    static readonly description = 'You are safe from the Demon.';

    protected power: SoldierSafeFromDemonEffect =
        new SoldierSafeFromDemonEffect();

    useWhenMalfunction(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);

        context.requestedPlayer.effects.add(
            this.power,
            CompositeGamePhaseKind.EveryNight
        );
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Soldier player ${context.requestedPlayer} is not safe from the demon when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `Soldier player ${context.requestedPlayer} is safe from the demon`;
    }
}

export interface SoldierAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SoldierAbility = RequireSetup(BaseSoldierAbility);
