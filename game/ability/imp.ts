import type { CharacterToken } from '../character';
import type { DeadReason } from '../dead-reason';
import { CharacterNightEffect } from '../effect/character';
import { Effect, InteractionContext } from '../effect/effect';
import type { Players } from '../players';
import type { NextFunction } from '../proxy/middleware';
import type { AnyFactory, ImpPlayer, MinionPlayer } from '../types';
import { Environment } from '~/interaction/environment';
import { Imp } from '~/content/characters/output/imp';

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

    protected async chooseAliveMinion(): Promise<MinionPlayer> {
        const players = await this.getPlayers();
        const aliveMinions = await players.filterAllAsync(
            async (player) => (await player.alive) && (await player.isMinion)
        );

        const chosenMinion =
            await Environment.current.gameUI.storytellerChooseOne(
                aliveMinions,
                BaseImpMakeCopyEffect.description
            );
        return chosenMinion;
    }

    protected async minionBecomeDemon() {
        const minion = await this.chooseAliveMinion();
        await minion.assignCharacter(Imp);
    }
}

export const ImpMakeCopyEffect = CharacterNightEffect(BaseImpMakeCopyEffect);
