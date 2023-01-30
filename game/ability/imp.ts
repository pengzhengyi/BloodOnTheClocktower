import type { CharacterToken } from '../character';
import { DeadReason } from '../dead-reason';
import { CharacterNightEffect } from '../effect/character';
import { Effect, InteractionContext } from '../effect/effect';
import type { Players } from '../players';
import type { NextFunction } from '../proxy/middleware';
import type { AnyFactory, ImpPlayer, MinionPlayer } from '../types';
import type { IPlayer } from '../player';
import { ImpNotChoosePlayerToKill } from '../exception';
import type { Death } from '../death';
import { BasicGamePhaseKind } from '../game-phase-kind';
import {
    AbilitySuccessUseWhenMalfunction,
    AbilitySuccessUseWhenHasEffect,
} from './status';
import {
    Ability,
    AbilitySetupContext,
    AbilityUseContext,
    AbilityUseResult,
    RequireSetup,
} from './ability';
import { Imp } from '~/content/characters/output/imp';
import { InteractionEnvironment } from '~/interaction/environment';

class BaseImpMakeCopyEffect extends Effect<ImpPlayer> {
    static readonly description =
        'The Imp can make copies of itself... for a terrible price.';

    static readonly origin: CharacterToken = Imp;

    constructor(protected getPlayers: AnyFactory<Players>) {
        super();
    }

    isApplicable(context: InteractionContext<ImpPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'setDead') &&
            this.isImpSelfKill(context)
        );
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<ImpPlayer>,
        next: NextFunction<InteractionContext<ImpPlayer>>
    ): InteractionContext<ImpPlayer> {
        const originalSetDead = context.interaction.target.setDead.bind(
            context.interaction.target
        );

        context.result = async (reason: DeadReason) => {
            const death = await originalSetDead(reason);

            if (await context.interaction.target.dead) {
                await this.minionBecomeDemon();
            }

            return death;
        };

        const updatedContext = next(context);
        return updatedContext;
    }

    protected isImpSelfKill(context: InteractionContext<ImpPlayer>): boolean {
        return (
            this.matchTarget(
                context,
                (demonPlayer) =>
                    demonPlayer.storytellerGet('_character') === Imp
            ) && this.matchNotNullInitiatorSameAsTarget(context)
        );
    }

    protected async chooseAliveMinionPlayer(): Promise<MinionPlayer> {
        const players = await this.getPlayers();
        const aliveMinions = await players.filterAllAsync(
            async (player) => (await player.alive) && (await player.isMinion)
        );

        const chosenMinion =
            await InteractionEnvironment.current.gameUI.storytellerChooseOne(
                aliveMinions,
                BaseImpMakeCopyEffect.description
            );
        return chosenMinion;
    }

    protected async minionBecomeDemon() {
        const minionPlayer = await this.chooseAliveMinionPlayer();
        const assignmentResult = await minionPlayer.assignCharacter(
            Imp,
            undefined,
            true,
            BaseImpMakeCopyEffect.description
        );
        return assignmentResult;
    }
}

export const ImpMakeCopyEffect = CharacterNightEffect(BaseImpMakeCopyEffect);

export interface ImpAbilityUseResult extends AbilityUseResult {
    playerToKill?: IPlayer;
    death?: Death;
}

class BaseImpAbility extends Ability<AbilityUseContext, ImpAbilityUseResult> {
    /**
     * {@link `imp["ability"]`}
     */
    static readonly description =
        'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.';

    protected declare power: BaseImpMakeCopyEffect;

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        this.power = new ImpMakeCopyEffect(() => context.players);
        context.requestedPlayer.effects.add(
            this.power,
            BasicGamePhaseKind.NonfirstNight
        );
    }

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<ImpAbilityUseResult> {
        const playerToKill = await this.choosePlayerToKill(
            context.requestedPlayer,
            context.players,
            context
        );

        return {
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
            playerToKill,
        };
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<ImpAbilityUseResult> {
        const playerToKill = await this.choosePlayerToKill(
            context.requestedPlayer,
            context.players,
            context
        );

        const death = await this.killPlayer(
            context.requestedPlayer,
            playerToKill
        );

        return {
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context, playerToKill),
            playerToKill,
            death,
        };
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected async choosePlayerToKill(
        impPlayer: ImpPlayer,
        players: Players,
        context: AbilityUseContext
    ): Promise<IPlayer> {
        let chosen = (await InteractionEnvironment.current.gameUI.choose(
            impPlayer,
            players,
            1,
            BaseImpAbility.description
        )) as IPlayer | undefined;

        if (chosen === undefined) {
            const error = new ImpNotChoosePlayerToKill(impPlayer, context);
            await error.resolve();
            chosen = error.correctedPlayerToKill;
        }

        return chosen as IPlayer;
    }

    protected killPlayer(impPlayer: ImpPlayer, playerToKill: IPlayer) {
        return playerToKill.from(impPlayer).setDead(DeadReason.DemonAttack);
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Imp player ${context.requestedPlayer} cannot poison when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        playerToProtect: IPlayer
    ): string {
        return `Imp player ${context.requestedPlayer} choose to poison ${playerToProtect}`;
    }
}

export interface ImpAbility
    extends Ability<AbilityUseContext, ImpAbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ImpAbility = RequireSetup(BaseImpAbility);
