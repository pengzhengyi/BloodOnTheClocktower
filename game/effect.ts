import { ApplyFunction } from './middleware';
import { Player } from './player';
import {
    ProxyHandlerRequest,
    ProxyMiddleware,
    ProxyMiddlewareContext,
} from './proxymiddleware';
import { GAME_UI } from '~/interaction/gameui';

export type EffectTarget = Player | object;
export type EffectContext<TTarget extends object = EffectTarget> =
    ProxyMiddlewareContext<TTarget>;

/**
 * Effect is the influence resulting from player's character ability. Effect can impact either the state of the game or players.
 */
export abstract class Effect<TTarget extends object = EffectTarget>
    implements ProxyMiddleware<TTarget>
{
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

    abstract apply: ApplyFunction<EffectContext<TTarget>>;

    abstract isApplicable(_request: ProxyHandlerRequest<TTarget>): boolean;

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
