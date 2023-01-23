import { DeadReason } from '../dead-reason';
import { Effect, InteractionContext } from '../effect/effect';
import type { Execution } from '../execution';
import { BasicGamePhaseKind } from '../game-phase-kind';
import type { NextFunction } from '../proxy/middleware';
import type { Nomination } from '../nomination';
import type { VirginPlayer, RequireExecution } from '../types';
import { AbilityUseContext, Ability, AbilityUseResult } from './ability';
import {
    AbilitySuccessUseWhenMalfunction,
    AbilitySuccessUseWhenHasEffect,
} from './status';

export class NominateVirginPenalty extends Effect<Execution> {
    static readonly description =
        'The Virgin may inadvertently execute their accuser.';

    get hasNominatedVirgin(): boolean {
        return this._hasNominatedVirgin;
    }

    protected _hasNominatedVirgin = false;

    constructor(protected readonly virginPlayer: VirginPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<Execution>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'addNomination') &&
            !this._hasNominatedVirgin
        );
    }

    apply(
        context: InteractionContext<Execution>,
        next: NextFunction<InteractionContext<Execution>>
    ): InteractionContext<Execution> {
        const updatedContext = next(context);
        const execution = context.interaction.target as Execution;
        const originalAddNomination = (
            updatedContext.result as Execution['addNomination']
        ).bind(execution);

        const newAddNomination = async (
            nomination: Nomination
        ): Promise<boolean> => {
            const result = await originalAddNomination(nomination);

            if (
                nomination !== undefined &&
                nomination.nominated.equals(this.virginPlayer)
            ) {
                this._hasNominatedVirgin = true;

                if (await nomination.nominator.isTownsfolk) {
                    await execution.execute(
                        nomination.nominator,
                        DeadReason.NominateVirgin
                    );
                }
            }

            return result;
        };

        updatedContext.result = newAddNomination;
        return updatedContext;
    }
}

export interface VirginAbilityUseContext
    extends AbilityUseContext,
        RequireExecution {}

export class VirginAbility extends Ability<
    VirginAbilityUseContext,
    AbilityUseResult
> {
    /**
     * {@link `virgin["ability"]`}
     */
    static readonly description =
        'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.';

    get hasNominatedVirgin(): boolean {
        return this.penalty?.hasNominatedVirgin ?? false;
    }

    protected penalty?: NominateVirginPenalty;

    useWhenMalfunction(
        context: VirginAbilityUseContext
    ): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: VirginAbilityUseContext): Promise<AbilityUseResult> {
        this.addPenaltyToExecution(context.execution, context.requestedPlayer);

        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async isEligible(context: VirginAbilityUseContext): Promise<boolean> {
        return (await super.isEligible(context)) && !this.hasNominatedVirgin;
    }

    createContext(..._args: any[]): Promise<VirginAbilityUseContext> {
        // TODO
        throw new Error('Method not implemented.');
    }

    protected addPenaltyToExecution(
        execution: Execution,
        virginPlayer: VirginPlayer
    ) {
        if (this.penalty === undefined) {
            this.penalty = new NominateVirginPenalty(virginPlayer);
        }

        execution.effects.add(this.penalty, BasicGamePhaseKind.Other);
    }

    protected formatDescriptionForMalfunction(
        context: VirginAbilityUseContext
    ): string {
        return `Virgin player ${context.requestedPlayer} will not execute accuser when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: VirginAbilityUseContext
    ): string {
        return `Virgin player ${context.requestedPlayer} may inadvertently execute their accuser`;
    }
}
