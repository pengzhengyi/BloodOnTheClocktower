/* eslint-disable @typescript-eslint/no-redeclare */
import type { CharacterToken } from '../character';
import { CharacterNightEffect } from '../effect/character';
import { Effect, InteractionContext } from '../effect/effect';
import type {
    IEvent,
    INonBlockingSubscriber,
} from '../event-notification/types';
import { PoisonerNotChoosePlayerToPoison } from '../exception';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import { Phase } from '../phase';
import type { IPlayer } from '../player';
import type { Players } from '../players';
import type { IPoisonedReason } from '../poisoned-reason';
import type { PoisonerPlayer } from '../types';
import type { IGamePhaseNotification } from '../event-notification/notification/game-phase';
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
import { Environment } from '~/interaction/environment';
import { Poisoner } from '~/content/characters/output/poisoner';

class BasePoisonEffect
    extends Effect<IPlayer>
    implements IPoisonedReason, INonBlockingSubscriber
{
    static readonly description =
        'The Poisoner secretly disrupts character abilities.';

    static readonly origin: CharacterToken = Poisoner;

    blocking: false = false;

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
        const _playerToProtect = await this.choosePlayerToPoison(
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
        players: Players,
        context: AbilityUseContext
    ): Promise<IPlayer> {
        let chosen = (await Environment.current.gameUI.choose(
            poisonerPlayer,
            players,
            1,
            BasePoisonerAbility.description
        )) as IPlayer | undefined;

        if (chosen === undefined) {
            const error = new PoisonerNotChoosePlayerToPoison(
                poisonerPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedPlayerToPoison;
        }

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
