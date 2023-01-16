import type { Info } from '../info';
import type { InfoProvideContext } from '../provider/provider';
import {
    InfoRequestContext,
    InfoRequester,
    InformationRequestContext,
    InformationRequester,
} from './requester';
import type { Constructor } from '~/game/types';
import type { CharacterType } from '~/game/charactertype';
import type { CharacterToken } from '~/game/character';

type InfoRequesterConstructor<TInfoRequester> = Constructor<TInfoRequester>;

export function OncePerGame<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class OncePerGame extends InfoRequesterClass {
        get hasRequested(): boolean {
            return this._hasRequested;
        }

        protected _hasRequested = false;

        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (await super.isEligible(context)) && !this._hasRequested;
        }

        async request(
            context: TInfoRequestContext
        ): Promise<Info<TInformation>> {
            const info = await this._request(context);
            this._hasRequested = true;
            return info;
        }
    };
}

export function AtNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class AtNight extends InfoRequesterClass {
        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) && context.clocktower.isNight
            );
        }
    };
}

export function OnceAtNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return OncePerGame(AtNight(InfoRequesterClass));
}

export function AtFirstNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return OncePerGame(
        class AtFirstNight extends InfoRequesterClass {
            async isEligible(context: InfoProvideContext): Promise<boolean> {
                return (
                    (await super.isEligible(context)) &&
                    context.clocktower.isFirstNight
                );
            }
        }
    );
}

export const EachNight = AtNight;

export function EachNonfirstNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class EachNonfirstNight extends InfoRequesterClass {
        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) &&
                context.clocktower.isNonfirstNight
            );
        }
    };
}

export function IsAlive<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class IsAlive extends InfoRequesterClass {
        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) &&
                context.requestedPlayer.alive
            );
        }
    };
}

export function IsEvil<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class IsEvil extends InfoRequesterClass {
        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) &&
                (await context.requestedPlayer.isEvil)
            );
        }
    };
}

export function hasEnoughPlayerForDemonMinionInformation<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class HasEnoughPlayerForDemonMinionInformation extends InfoRequesterClass {
        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) && context.players.length >= 7
            );
        }
    };
}

export abstract class CharacterTypeInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends InformationRequester<TInformation, TInformationRequestContext> {
    abstract readonly expectedCharacterType: typeof CharacterType;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            (await context.requestedPlayer.characterType).is(
                this.expectedCharacterType
            )
        );
    }

    toString() {
        return `RequestInfoAs${this.expectedCharacterType}`;
    }
}

export abstract class CharacterInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends InformationRequester<TInformation, TInformationRequestContext> {
    abstract readonly expectedCharacter: CharacterToken;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        if (await super.isEligible(context)) {
            const character = await context.requestedPlayer.from(
                context.requestedPlayer
            ).character;
            return character === this.expectedCharacter;
        }

        return false;
    }

    toString() {
        return `RequestInfoAs${this.expectedCharacter}`;
    }
}
