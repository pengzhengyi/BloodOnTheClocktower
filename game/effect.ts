import { ApplyFunction, AsyncMiddleware } from './middleware';
import { Player } from './player';
import { GAME_UI } from '~/interaction/gameui';

export type EffectTarget = Player;

/**
 * Effect is the influence resulting from player's character ability. Effect can impact either the state of the game or players.
 */
export abstract class Effect<T = EffectTarget> implements AsyncMiddleware<T> {
    protected _active = true;

    get active(): boolean {
        return this._active;
    }

    async deactivate(reason?: string): Promise<boolean> {
        if (
            await GAME_UI.storytellerConfirm(
                this.formatDeactivatePrompt(reason)
            )
        ) {
            this._active = false;
            return true;
        }

        return false;
    }

    async reactivate(reason?: string): Promise<boolean> {
        if (
            await GAME_UI.storytellerConfirm(
                this.formatReactivatePrompt(reason)
            )
        ) {
            this._active = true;
            return true;
        }

        return false;
    }

    abstract apply: ApplyFunction<T>;

    abstract toString(): string;

    protected formatDeactivatePrompt(reason?: string): string {
        return `should deactivate ${this.toString()}${
            reason === undefined ? '' : ' because ' + reason
        }?`;
    }

    protected formatReactivatePrompt(reason?: string): string {
        return `should reactivate ${this.toString()}${
            reason === undefined ? '' : ' because ' + reason
        }?`;
    }
}
