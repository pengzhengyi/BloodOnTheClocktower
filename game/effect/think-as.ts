import type { CharacterToken } from '../character';
import type { IPlayer } from '../player';
import type { NextFunction } from '../proxy/middleware';
import { Effect, type InteractionContext } from './effect';

export abstract class ThinkAsEffect<
    TPlayer extends IPlayer,
    V
> extends Effect<TPlayer> {
    abstract readonly propertyName: keyof TPlayer;

    abstract readonly thinkAs: V;

    isApplicable(context: InteractionContext<TPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.matchNotNullInitiatorSameAsTarget(context) &&
            this.isGetProperty(context, this.propertyName)
        );
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<TPlayer>,
        next: NextFunction<InteractionContext<TPlayer>>
    ): InteractionContext<TPlayer> {
        context.result = Promise.resolve(this.thinkAs);
        const updatedContext = next(context);
        return updatedContext;
    }
}

export class ThinkAsCharacterEffect<
    TPlayer extends IPlayer
> extends ThinkAsEffect<TPlayer, CharacterToken> {
    readonly propertyName = 'character';

    readonly thinkAs: CharacterToken;

    constructor(thinkAs: CharacterToken) {
        super();
        this.thinkAs = thinkAs;
    }
}
