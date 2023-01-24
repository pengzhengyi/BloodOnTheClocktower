import { Alignment } from '../alignment';
import type { CharacterToken } from '../character';
import type { IPlayer } from '../player';
import type { NextFunction } from '../proxy/middleware';
import { Effect, InteractionContext } from './effect';
import { Environment } from '~/interaction/environment';

abstract class RegisterAsEffect<
    TPlayer extends IPlayer,
    V
> extends Effect<TPlayer> {
    abstract readonly propertyName: keyof TPlayer;

    abstract readonly options: Iterable<V>;

    abstract readonly recommended?: V;

    isApplicable(context: InteractionContext<TPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.matchNotNullInitiatorDifferentThanTarget(context) &&
            this.isGetProperty(context, this.propertyName)
        );
    }

    apply(
        context: InteractionContext<TPlayer>,
        next: NextFunction<InteractionContext<TPlayer>>
    ): InteractionContext<TPlayer> {
        const updatedContext = next(context);
        const registerAs = this.choose(context);
        updatedContext.result = registerAs;
        return updatedContext;
    }

    protected async choose(context: InteractionContext<TPlayer>): Promise<V> {
        return await Environment.current.gameUI.storytellerChooseOne(
            this.options,
            this.formatPromptForChoose(context),
            this.recommended
        );
    }

    protected formatPromptForChoose(
        context: InteractionContext<TPlayer>
    ): string {
        const recommendation =
            this.recommended === undefined
                ? ''
                : ` (recommended: ${this.recommended})`;

        return `Choose ${this.propertyName as string} for player ${
            context.interaction.target
        }${recommendation}.`;
    }
}

abstract class RegisterAsAlignmentEffect<
    TPlayer extends IPlayer
> extends RegisterAsEffect<TPlayer, Alignment> {
    static readonly options = [Alignment.Good, Alignment.Evil];

    abstract readonly alignment: Alignment;

    readonly propertyName = 'alignment';

    get recommended() {
        return this.alignment;
    }

    get options(): Array<Alignment> {
        return RegisterAsAlignmentEffect.options;
    }
}

export abstract class RegisterAsGoodAlignmentEffect<
    TPlayer extends IPlayer
> extends RegisterAsAlignmentEffect<TPlayer> {
    readonly alignment = Alignment.Good;
}

export abstract class RegisterAsEvilAlignmentEffect<
    TPlayer extends IPlayer
> extends RegisterAsAlignmentEffect<TPlayer> {
    readonly alignment = Alignment.Evil;
}

export abstract class RegisterAsCharacterEffect<
    TPlayer extends IPlayer
> extends RegisterAsEffect<TPlayer, CharacterToken> {
    readonly propertyName = 'character';
}
