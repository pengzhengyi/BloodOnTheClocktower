import { Alignment } from '../alignment';
import { DeadReason } from '../deadreason';
import { Effect, InteractionContext } from '../effect';
import type { Game } from '../game';
import { BasicGamePhaseKind, CompositeGamePhaseKind } from '../gamephase';
import type { NextFunction } from '../middleware';
import type { Player } from '../player';
import type { Players } from '../players';
import type { MayorPlayer, RequireGame } from '../types';
import {
    Ability,
    AbilitySetupContext,
    AbilityUseContext,
    AbilityUseResult,
    RequireSetup,
} from './ability';
import {
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
} from './status';
import { GAME_UI } from '~/interaction/gameui';

export class MayorPeacefulWinEffect extends Effect<Game> {
    static readonly description =
        'The Mayor can win by peaceful means on the final day.';

    constructor(protected readonly mayorPlayer: MayorPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<Game>): boolean {
        return (
            super.isApplicable(context) &&
            this.mayorPlayer.hasAbility &&
            this.isGetProperty(context, 'getWinningTeam')
        );
    }

    apply(
        context: InteractionContext<Game>,
        next: NextFunction<InteractionContext<Game>>
    ): InteractionContext<Game> {
        const updatedContext = next(context);

        const game = context.interaction.target;
        const getWinningTeamMethod = updatedContext.result.bind();

        updatedContext.result = async (players: Iterable<Player>) => {
            const winningTeam = await getWinningTeamMethod(players);

            if (winningTeam === undefined && this.isPeacefulWin(game)) {
                return Alignment.Good;
            }

            return winningTeam;
        };
        return updatedContext;
    }

    protected isPeacefulWin(game: Game) {
        return !game.hasExecution && game.alivePlayers.count() === 3;
    }
}

export class MayorDieInsteadEffect extends Effect<MayorPlayer> {
    static readonly description =
        'If mayor die at night, another player might die instead.';

    constructor(protected readonly players: Players) {
        super();
    }

    isApplicable(context: InteractionContext<MayorPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isTargetHasAbility(context) &&
            this.matchDemonKill(context)
        );
    }

    apply(
        context: InteractionContext<MayorPlayer>,
        next: NextFunction<InteractionContext<MayorPlayer>>
    ): InteractionContext<MayorPlayer> {
        const updatedContext = next(context);

        const killer = context.initiator;
        const mayorPlayer = context.interaction.target;
        const setDeadMethod = updatedContext.result.bind(mayorPlayer);

        updatedContext.result = async (
            reason: DeadReason = DeadReason.Other
        ) => {
            const chosenPlayerToDie = await this.choosePlayerToDieInstead(
                this.players
            );

            if (chosenPlayerToDie.equals(mayorPlayer)) {
                // storyteller still chooses mayor to die
                return await setDeadMethod(reason);
            } else {
                return await chosenPlayerToDie.from(killer).setDead(reason);
            }
        };
        return updatedContext;
    }

    protected async choosePlayerToDieInstead(
        players: Iterable<Player>
    ): Promise<Player> {
        return (await GAME_UI.storytellerChooseOne(
            players,
            MayorDieInsteadEffect.description
        )) as Player;
    }
}

export interface MayorAbilitySetupContext
    extends AbilitySetupContext,
        RequireGame {}

class BaseMayorAbility extends Ability<
    AbilityUseContext,
    AbilityUseResult,
    MayorAbilitySetupContext
> {
    /**
     * {@link `mayor["ability"]`}
     */
    static readonly description =
        'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.';

    protected declare mayorDieInsteadEffect: MayorDieInsteadEffect;

    protected declare mayorPeacefulWinEffect: MayorPeacefulWinEffect;

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

    async setup(context: MayorAbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.mayorDieInsteadEffect = new MayorDieInsteadEffect(context.players);
        context.requestedPlayer.effects.add(
            this.mayorDieInsteadEffect,
            CompositeGamePhaseKind.EveryNight
        );

        this.mayorPeacefulWinEffect = new MayorPeacefulWinEffect(
            context.requestedPlayer
        );
        context.game.effects.add(
            this.mayorPeacefulWinEffect,
            BasicGamePhaseKind.Other
        );
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Mayor player ${context.requestedPlayer} cannot win by peaceful means and safe from dying at night when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `Mayor player ${context.requestedPlayer} can win by peaceful means and safe from dying at night`;
    }
}

export interface MayorAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MayorAbility = RequireSetup(BaseMayorAbility);
