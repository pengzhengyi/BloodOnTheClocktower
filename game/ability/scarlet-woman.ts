import type { CharacterToken } from '../character/character';
import type {
    AnyFactory,
    DemonPlayer,
    Factory,
    ScarletWomanPlayer,
} from '../types';
import { Effect, type InteractionContext } from '../effect/effect';
import type { NextFunction } from '../proxy/middleware';
import { CharacterNightEffect } from '../effect/character';
import type { DeadReason } from '../dead-reason';
import type { IPlayer } from '../player';
import type { IPlayers } from '../players';
import type { INonBlockingSubscriber } from '../event-notification/types';
import {
    ChangeType,
    type ICharacterTypeChangeEvent,
} from '../event-notification/event/character-type-change';
import type { ICharacterTypeChangeNotification } from '../event-notification/notification/character-type-change';
import {
    BecomeDemonCategory,
    LoseDemonCategory,
} from '../event-notification/event-category/character-type-change';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import {
    Ability,
    type AbilitySetupContext,
    type AbilityUseContext,
    type AbilityUseResult,
    RequireSetup,
} from './ability';
import {
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
} from './status';
import { ScarletWoman } from '~/content/characters/output/scarletwoman';

class BaseScarletWomanBecomeDemonEffect
    extends Effect<DemonPlayer>
    implements INonBlockingSubscriber
{
    static readonly description =
        'The Scarlet Woman becomes the Demon when the Demon dies.';

    static readonly origin: CharacterToken = ScarletWoman;

    static MINIMUM_NUM_PLAYER_FOR_SCARLET_WOMAN_TO_BECOME_DEMON = 5;

    blocking = false as const;

    constructor(
        protected readonly scarletWomanPlayer: ScarletWomanPlayer,
        protected getPlayers: AnyFactory<IPlayers>
    ) {
        super();
    }

    isApplicable(context: InteractionContext<DemonPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'setDead') &&
            this.matchTarget(context, (demonPlayer) =>
                demonPlayer.storytellerGet('_isDemon')
            )
        );
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<DemonPlayer>,
        next: NextFunction<InteractionContext<DemonPlayer>>
    ): InteractionContext<DemonPlayer> {
        const originalSetDead = context.interaction.target.setDead.bind(
            context.interaction.target
        );

        context.result = async (reason: DeadReason) => {
            const canBecomeDemon = await this.canBecomeDemon();
            const death = await originalSetDead(reason);

            if ((await context.interaction.target.dead) && canBecomeDemon) {
                await this.becomeDemon(context.interaction.target);
            }

            return death;
        };

        const updatedContext = next(context);
        return updatedContext;
    }

    notify(event: ICharacterTypeChangeEvent): void {
        if (event.characterTypeChange.changeType === ChangeType.Become) {
            this.addTo(event.affectedPlayer);
        } else if (event.characterTypeChange.changeType === ChangeType.Lose) {
            this.deleteFrom(event.affectedPlayer);
        }
    }

    setupNotification(
        notification: ICharacterTypeChangeNotification,
        priority?: number
    ) {
        notification.subscribe(
            BecomeDemonCategory.getInstance(),
            this,
            priority
        );
        notification.subscribe(LoseDemonCategory.getInstance(), this, priority);
    }

    addTo(player: IPlayer) {
        player.effects.add(this, CompositeGamePhaseKind.ALL);
    }

    deleteFrom(player: IPlayer) {
        player.effects.delete(this);
    }

    protected async becomeDemon(deadDemonPlayer: DemonPlayer) {
        const deadDemon = await deadDemonPlayer.character;
        const assignmentResult = await this.scarletWomanPlayer.assignCharacter(
            deadDemon,
            undefined,
            true,
            BaseScarletWomanBecomeDemonEffect.description
        );
        return assignmentResult;
    }

    protected async canBecomeDemon(): Promise<boolean> {
        const players = await this.getPlayers();

        let playerCount = 0;
        for await (const _aliveNontravellerPlayer of players
            .clone()
            .filterAsync((player) => player.isAliveNontraveller)) {
            playerCount++;

            if (
                playerCount >=
                BaseScarletWomanBecomeDemonEffect.MINIMUM_NUM_PLAYER_FOR_SCARLET_WOMAN_TO_BECOME_DEMON
            ) {
                return true;
            }
        }

        return false;
    }
}

export const ScarletWomanBecomeDemonEffect = CharacterNightEffect(
    BaseScarletWomanBecomeDemonEffect
);

class BaseScarletWomanAbility extends Ability<
    AbilityUseContext,
    AbilityUseResult
> {
    /**
     * {@link `ScarletWoman["ability"]`}
     */
    static readonly description =
        "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count)";

    protected declare becomeDemonEffect: BaseScarletWomanBecomeDemonEffect;

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
        this.initializeBecomeDemonEffect(
            context.requestedPlayer,
            () => context.players
        );

        const demonPlayers = await context.players.isDemon;
        this.applyBecomeDemonEffect(demonPlayers);

        // TODO setup new demon notification
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `ScarletWoman player ${context.requestedPlayer} can not become demon when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `ScarletWoman player ${context.requestedPlayer} can become demon when the Demon dies`;
    }

    protected initializeBecomeDemonEffect(
        scarletWomanPlayer: ScarletWomanPlayer,
        getPlayers: Factory<IPlayers>
    ) {
        this.becomeDemonEffect = new ScarletWomanBecomeDemonEffect(
            scarletWomanPlayer,
            getPlayers
        );
    }

    protected applyBecomeDemonEffect(demonPlayers: Iterable<DemonPlayer>) {
        for (const demonPlayer of demonPlayers) {
            this.becomeDemonEffect.addTo(demonPlayer);
        }
    }
}

export interface ScarletWomanAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ScarletWomanAbility = RequireSetup(BaseScarletWomanAbility);
