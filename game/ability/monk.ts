import { MonkNotChoosePlayerToProtect } from '../exception/monk-not-choose-player-to-protect';
import { BasicGamePhaseKind } from '../game-phase-kind';
import type { CharacterToken } from '../character/character';
import type { IPlayer } from '../player';
import type { IPlayers } from '../players';
import type { MonkPlayer } from '../types';
import { SafeFromDemonEffect } from '../effect/safe-from-demon';
import { CharacterNightEffect } from '../effect/character';
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
import { Monk } from '~/content/characters/output/monk';

class BaseMonkProtectionEffect extends SafeFromDemonEffect<MonkPlayer> {
    static readonly description =
        'The Monk protects other players from the Demon.';

    static readonly origin: CharacterToken = Monk;
}

export const MonkProtectionEffect = CharacterNightEffect(
    BaseMonkProtectionEffect
);

export interface MonkAbilityUseResult extends AbilityUseResult {
    protectedPlayer?: IPlayer;
}

class BaseMonkProtectAbility extends Ability<
    AbilityUseContext,
    MonkAbilityUseResult
> {
    /**
     * {@link `monk["ability"]`}
     */
    static readonly description =
        'Each night*, choose a player (not yourself): they are safe from the Demon tonight.';

    protected protected: Array<IPlayer | undefined> = [];

    protected protection = new MonkProtectionEffect();

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        this.protection.setupPriority(context.nightSheet);
    }

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<MonkAbilityUseResult> {
        const _playerToProtect = await this.choosePlayerToProtect(
            context.requestedPlayer,
            context.players,
            context
        );
        this.updatePlayerToProtect();

        return {
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        };
    }

    async loseAbility(reason?: string): Promise<void> {
        await super.loseAbility(reason);
        await this.protection.deactivate(reason);
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<MonkAbilityUseResult> {
        const playerToProtect = await this.choosePlayerToProtect(
            context.requestedPlayer,
            context.players,
            context
        );
        this.updatePlayerToProtect(playerToProtect);

        return {
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(
                context,
                playerToProtect
            ),
            protectedPlayer: playerToProtect,
        };
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected updatePlayerToProtect(playerToProtect?: IPlayer) {
        const previousPlayerToProtect = this.protected.at(-1);
        if (
            previousPlayerToProtect !== undefined &&
            (playerToProtect === undefined ||
                !playerToProtect.equals(previousPlayerToProtect))
        ) {
            previousPlayerToProtect.effects.delete(this.protection);
        }

        this.protected.push(playerToProtect);
        playerToProtect?.effects.add(
            this.protection,
            BasicGamePhaseKind.NonfirstNight
        );
    }

    protected async choosePlayerToProtect(
        monkPlayer: MonkPlayer,
        players: IPlayers,
        context: AbilityUseContext
    ): Promise<IPlayer> {
        let chosen = await this.chooseOneOtherPlayer(
            monkPlayer,
            players,
            BaseMonkProtectAbility.description
        );

        if (chosen === undefined) {
            const error = new MonkNotChoosePlayerToProtect(monkPlayer, context);
            await error.resolve();
            chosen = error.correctedPlayerToProtect;
        }

        return chosen as IPlayer;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Monk player ${context.requestedPlayer} cannot protect when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        playerToProtect: IPlayer
    ): string {
        return `Monk player ${context.requestedPlayer} choose to protect ${playerToProtect}`;
    }
}

export interface MonkProtectAbility
    extends Ability<AbilityUseContext, MonkAbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MonkProtectAbility = RequireSetup(BaseMonkProtectAbility);
