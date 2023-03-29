/* eslint-disable @typescript-eslint/no-redeclare */
import { CharacterNightEffect } from '../effect/character';
import { Effect, type InteractionContext } from '../effect/effect';
import type {
    IEvent,
    INonBlockingSubscriber,
} from '../event-notification/types';
import { PoisonerNotChoosePlayerToPoison } from '../exception/poisoner-not-choose-player-to-poison';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import { Phase } from '../phase';
import type { IPlayer, IPlayer as PoisonerPlayer } from '../player';
import type { IPlayers } from '../players';
import type { IPoisonedReason } from '../poisoned-reason';
import type { IGamePhaseNotification } from '../event-notification/notification/game-phase';
import type { CharacterId } from '../character/character-id';
import { CharacterIds } from '../character/character-id';
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

class BasePoisonEffect
    extends Effect<IPlayer>
    implements IPoisonedReason, INonBlockingSubscriber
{
    static readonly description =
        'The Poisoner secretly disrupts character abilities.';

    static readonly origin: CharacterId = CharacterIds.Poisoner;

    blocking = false as const;

    get reason(): string {
        return BasePoisonEffect.description;
    }

    poisonedPlayer?: IPlayer;

    isApplicable(_context: InteractionContext<IPlayer>): boolean {
        return false;
    }

    async deactivate(reason?: string): Promise<boolean> {
        if (await super.deactivate(reason)) {
            this.removePoison();
            return true;
        }

        return false;
    }

    async reactivate(reason?: string): Promise<boolean> {
        if (await super.reactivate(reason)) {
            this.addPoison();
            return true;
        }

        return false;
    }

    notify(_event: IEvent): void {
        this.removePoison();
    }

    setupPoisonFadeAway(
        notification: IGamePhaseNotification,
        priority?: number
    ) {
        notification.subscribe(Phase.Dusk, this, priority);
    }

    addPoison() {
        this.poisonedPlayer?.setPoison(this);
    }

    removePoison() {
        this.poisonedPlayer?.removePoison(this);
    }
}

export const PoisonEffect = CharacterNightEffect(BasePoisonEffect);

export interface PoisonerAbilityUseResult extends AbilityUseResult {
    poisonedPlayer?: IPlayer;
}

class BasePoisonerAbility extends Ability<
    AbilityUseContext,
    PoisonerAbilityUseResult
> {
    /**
     * {@link `poisoner["ability"]`}
     */
    static readonly description =
        'Each night, choose a player: they are poisoned tonight and tomorrow day.';

    protected poisoned: Array<IPlayer | undefined> = [];

    protected poison = new PoisonEffect();

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        this.poison.setupPriority(context.nightSheet);
        this.poison.setupPoisonFadeAway(context.clocktower.notification);
    }

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<PoisonerAbilityUseResult> {
        const _playerToPoison = await this.choosePlayerToPoison(
            context.requestedPlayer,
            context.players,
            context
        );
        this.updatePlayerToPoison();

        return {
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        };
    }

    async loseAbility(reason?: string): Promise<void> {
        await super.loseAbility(reason);
        await this.poison.deactivate(reason);
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<PoisonerAbilityUseResult> {
        const playerToPoison = await this.choosePlayerToPoison(
            context.requestedPlayer,
            context.players,
            context
        );
        this.updatePlayerToPoison(playerToPoison);

        return {
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(
                context,
                playerToPoison
            ),
            poisonedPlayer: playerToPoison,
        };
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected updatePlayerToPoison(playerToPoison?: IPlayer) {
        const previousPlayerToPoison = this.poisoned.at(-1);
        if (
            previousPlayerToPoison !== undefined &&
            (playerToPoison === undefined ||
                !playerToPoison.equals(previousPlayerToPoison))
        ) {
            this.poison.removePoison();
            previousPlayerToPoison.effects.delete(this.poison);
        }

        this.poisoned.push(playerToPoison);
        this.poison.poisonedPlayer = playerToPoison;
        this.poison.addPoison();
        playerToPoison?.effects.add(this.poison, CompositeGamePhaseKind.ALL);
    }

    protected async choosePlayerToPoison(
        poisonerPlayer: PoisonerPlayer,
        players: IPlayers,
        context: AbilityUseContext
    ): Promise<IPlayer> {
        let chosen = await this.chooseOnePlayer(
            poisonerPlayer,
            players,
            BasePoisonerAbility.description
        );

        chosen = await PoisonerNotChoosePlayerToPoison.ternary(
            () => chosen !== undefined,
            () => chosen,
            () => new PoisonerNotChoosePlayerToPoison(poisonerPlayer, context),
            (error) => error.correctedPlayerToPoison
        );

        return chosen as IPlayer;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Poisoner player ${context.requestedPlayer} cannot poison when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        playerToProtect: IPlayer
    ): string {
        return `Poisoner player ${context.requestedPlayer} choose to poison ${playerToProtect}`;
    }
}

export interface PoisonerAbility
    extends Ability<AbilityUseContext, PoisonerAbilityUseResult> {}

export const PoisonerAbility = RequireSetup(BasePoisonerAbility);
