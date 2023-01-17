import { GAME_UI } from '../dependencies.config';
import { Effect, InteractionContext } from '../effect';
import { ButlerNotChooseMasterToFollow } from '../exception';
import { BasicGamePhaseKind } from '../gamephase';
import type { NextFunction } from '../middleware';
import type { Player } from '../player';
import type { Players } from '../players';
import type { ButlerPlayer } from '../types';
import { Ability, AbilityUseContext, AbilityUseResult } from './ability';
import {
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
} from './status';

export class ButlerFollowMasterVoteEffect extends Effect<ButlerPlayer> {
    static readonly description =
        'The Butler may only vote when their Master (another player) votes.';

    declare master?: Player;

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

    apply(
        context: InteractionContext<ButlerPlayer>,
        next: NextFunction<InteractionContext<ButlerPlayer>>
    ): InteractionContext<ButlerPlayer> {
        const updatedContext = next(context);
        updatedContext.result = this.canVote();
        return updatedContext;
    }

    protected canVote(): Promise<boolean> {
        return GAME_UI.hasRaisedHandForVote(this.master!);
    }
}

export interface ButlerAbilityUseResult extends AbilityUseResult {
    master: Player;
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

    protected async updateMaster(butlerPlayer: ButlerPlayer, master?: Player) {
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
        players: Players,
        context: AbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            butlerPlayer,
            players.isNot(butlerPlayer),
            1,
            ButlerAbility.description
        )) as Player;

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
        master: Player
    ): string {
        return `Butler player ${context.requestedPlayer} chooses player ${master} as master. But due to ability malfunction, Butler player's vote will be counted normally`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        master: Player
    ): string {
        return `Butler player ${context.requestedPlayer} chooses player ${master} as master.`;
    }
}
