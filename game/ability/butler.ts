import { Effect, type InteractionContext } from '../effect/effect';
import { ButlerNotChooseMasterToFollow } from '../exception';
import { BasicGamePhaseKind } from '../game-phase-kind';
import type { NextFunction } from '../proxy/middleware';
import type { IPlayer } from '../player';
import type { IPlayers } from '../players';
import type { ButlerPlayer } from '../types';
import {
    Ability,
    type AbilityUseContext,
    type AbilityUseResult,
} from './ability';
import {
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
} from './status';
import { InteractionEnvironment } from '~/interaction/environment';

export class ButlerFollowMasterVoteEffect extends Effect<ButlerPlayer> {
    static readonly description =
        'The Butler may only vote when their Master (another player) votes.';

    declare master?: IPlayer;

    constructor(protected readonly butlerPlayer: ButlerPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<ButlerPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isTargetHasAbility(context) &&
            this.master !== undefined &&
            this.isGetProperty(context, 'canVote')
        );
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<ButlerPlayer>,
        next: NextFunction<InteractionContext<ButlerPlayer>>
    ): InteractionContext<ButlerPlayer> {
        context.result = this.canVote();
        const updatedContext = next(context);
        return updatedContext;
    }

    protected canVote(): Promise<boolean> {
        return InteractionEnvironment.current.gameUI.hasRaisedHandForVote(
            this.master!
        );
    }
}

export interface ButlerAbilityUseResult extends AbilityUseResult {
    master: IPlayer;
}

export class ButlerAbility extends Ability<
    AbilityUseContext,
    ButlerAbilityUseResult
> {
    /**
     * {@link `butler["ability"]`}
     */
    static readonly description =
        'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.';

    protected effect?: ButlerFollowMasterVoteEffect;

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<ButlerAbilityUseResult> {
        const master = await this.chooseMaster(
            context.requestedPlayer,
            context.players,
            context
        );

        await this.updateMaster(context.requestedPlayer);

        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            master,
            description: this.formatDescriptionForMalfunction(context, master),
        });
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<ButlerAbilityUseResult> {
        const master = await this.chooseMaster(
            context.requestedPlayer,
            context.players,
            context
        );

        await this.updateMaster(context.requestedPlayer, master);

        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            master,
            description: this.formatDescriptionForNormal(context, master),
        });
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO
        throw new Error('Method not implemented.');
    }

    protected async updateMaster(butlerPlayer: ButlerPlayer, master?: IPlayer) {
        if (this.effect === undefined) {
            this.effect = new ButlerFollowMasterVoteEffect(butlerPlayer);
            butlerPlayer.effects.add(this.effect, BasicGamePhaseKind.Other);
        }

        this.effect.master = master;
        if (master === undefined && this.effect.active) {
            await this.effect.deactivate(
                'Butler can vote normally when ability malfunctions'
            );
        } else if (master !== undefined && !this.effect.active) {
            await this.effect.reactivate(
                'The Butler may only vote when their Master votes if ability does not malfunction'
            );
        }
    }

    protected async chooseMaster(
        butlerPlayer: ButlerPlayer,
        players: IPlayers,
        context: AbilityUseContext
    ): Promise<IPlayer> {
        let chosen = (await InteractionEnvironment.current.gameUI.choose(
            butlerPlayer,
            players.isNot(butlerPlayer),
            1,
            ButlerAbility.description
        )) as IPlayer;

        if (chosen === undefined) {
            const error = new ButlerNotChooseMasterToFollow(
                butlerPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedMaster;
        }

        return chosen;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext,
        master: IPlayer
    ): string {
        return `Butler player ${context.requestedPlayer} chooses player ${master} as master. But due to ability malfunction, Butler player's vote will be counted normally`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        master: IPlayer
    ): string {
        return `Butler player ${context.requestedPlayer} chooses player ${master} as master.`;
    }
}
