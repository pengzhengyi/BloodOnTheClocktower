import { Effect, type InteractionContext } from '../effect/effect';
import type { Execution } from '../execution';
import type { IGame } from '../game';
import { BasicGamePhaseKind } from '../game-phase-kind';
import type { NextFunction } from '../proxy/middleware';
import type { RequireExecution } from '../types';
import type { IPlayer as SaintPlayer } from '../player';
import type { AbilitySetupContext } from './ability';
import {
    type AbilityUseContext,
    Ability,
    type AbilityUseResult,
    RequireSetup,
} from './ability';
import {
    AbilitySuccessUseWhenMalfunction,
    AbilitySuccessUseWhenHasEffect,
} from './status';

export class SaintEndsGamePenalty extends Effect<Execution> {
    static readonly description =
        'The Saint ends the game if they are executed.';

    constructor(
        protected readonly saintPlayer: SaintPlayer,
        protected readonly game: IGame
    ) {
        super();
    }

    isApplicable(context: InteractionContext<Execution>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'execute')
        );
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<Execution>,
        next: NextFunction<InteractionContext<Execution>>
    ): InteractionContext<Execution> {
        const execution = context.interaction.target as Execution;
        const originalExecute = execution.execute.bind(execution);

        const newExecute: Execution['execute'] = async (player, deadReason) => {
            const death = await originalExecute(player, deadReason);

            if (death !== undefined && death.isFor(this.saintPlayer)) {
                await this.endGame();
            }

            return death;
        };

        context.result = newExecute;
        const updatedContext = next(context);
        return updatedContext;
    }

    protected async endGame() {
        const alignment = await this.saintPlayer.alignment;
        this.game.setWinningTeam(alignment, SaintEndsGamePenalty.description);
    }
}

export interface SaintAbilityUseContext
    extends AbilityUseContext,
        RequireExecution {}

class BaseSaintAbility extends Ability<
    SaintAbilityUseContext,
    AbilityUseResult
> {
    /**
     * {@link `saint["ability"]`}
     */
    static readonly description = 'If you die by execution, your team loses.';

    declare penalty: SaintEndsGamePenalty;

    useWhenMalfunction(
        context: SaintAbilityUseContext
    ): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: SaintAbilityUseContext): Promise<AbilityUseResult> {
        this.addPenaltyToExecution(context.execution);

        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.penalty = new SaintEndsGamePenalty(
            context.requestedPlayer,
            context.game
        );
    }

    createContext(..._args: any[]): Promise<SaintAbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected addPenaltyToExecution(execution: Execution) {
        execution.effects.add(this.penalty, BasicGamePhaseKind.Other);
    }

    protected formatDescriptionForMalfunction(
        context: SaintAbilityUseContext
    ): string {
        return `Saint player ${context.requestedPlayer} will not end the game when executed when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: SaintAbilityUseContext
    ): string {
        return `Saint player ${context.requestedPlayer} will end the game when executed`;
    }
}

export interface SaintAbility
    extends Ability<SaintAbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SaintAbility = RequireSetup(BaseSaintAbility);
