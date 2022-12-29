/* eslint-disable unused-imports/no-unused-vars */
import type { CharacterToken } from './character';
import type { InfoProvideContext } from './infoprovider';
import type {
    ChefInformation,
    DemonInformation,
    Info,
    Information,
    InvestigatorInformation,
    LibrarianInformation,
    StoryTellerInformation,
    WasherwomanInformation,
} from './information';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Librarian } from '~/content/characters/output/librarian';
import { Investigator } from '~/content/characters/output/investigator';
import { Chef } from '~/content/characters/output/chef';

export interface InfoRequestContext<TInformation> extends InfoProvideContext {
    // eslint-disable-next-line no-use-before-define
    requester: IInfoRequester<TInformation, this>;

    isStoryTellerInformation: boolean;
}

export interface InformationRequestContext<TInformation>
    extends InfoRequestContext<TInformation> {
    willGetTrueInformation: boolean;
}

export interface IInfoRequester<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>
> {
    isEligible(context: TInfoRequestContext): Promise<boolean>;

    request(context: TInfoRequestContext): Promise<Info<TInformation>>;

    createContext(...args: any[]): Promise<TInfoRequestContext>;
}

export class InfoRequester<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>
> implements IInfoRequester<TInformation, TInfoRequestContext>
{
    request(context: TInfoRequestContext): Promise<Info<TInformation>> {
        return this._request(context);
    }

    async isEligible(_context: TInfoRequestContext): Promise<boolean> {
        return await true;
    }

    createContext(..._args: any[]): Promise<TInfoRequestContext> {
        throw new Error('Method not implemented.');
    }

    _request(context: TInfoRequestContext): Promise<Info<TInformation>> {
        return context.storyteller.giveInfo(context);
    }
}

export interface IInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends IInfoRequester<TInformation, TInformationRequestContext> {
    willGetTrueInformation(
        context: TInformationRequestContext
    ): Promise<boolean>;

    request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>>;
}

export class InformationRequester<
        TInformation,
        TInformationRequestContext extends InformationRequestContext<TInformation>
    >
    extends InfoRequester<TInformation, TInformationRequestContext>
    implements IInformationRequester<TInformation, TInformationRequestContext>
{
    async willGetTrueInformation(
        context: TInformationRequestContext
    ): Promise<boolean> {
        return (
            (await !context.requestedPlayer.drunk) &&
            !context.requestedPlayer.poisoned
        );
    }

    createContext(..._args: any[]): Promise<TInformationRequestContext> {
        throw new Error('Method not implemented.');
    }

    request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>> {
        return this._request(context);
    }

    _request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>> {
        return context.storyteller.giveInfo(context);
    }
}

export interface IStoryTellerInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends IInfoRequester<TInformation, TInformationRequestContext> {
    request(
        context: TInformationRequestContext
    ): Promise<StoryTellerInformation<TInformation>>;
}

type InfoRequesterConstructor<TInfoRequester> = new (
    ...args: any[]
) => TInfoRequester;

function OncePerGame<
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

        async isEligible(context: TInfoRequestContext): Promise<boolean> {
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

function AtNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class AtNight extends InfoRequesterClass {
        async isEligible(context: TInfoRequestContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) && context.clocktower.isNight
            );
        }
    };
}

function OnceAtNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return OncePerGame(AtNight(InfoRequesterClass));
}

function AtFirstNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return OncePerGame(
        class AtFirstNight extends InfoRequesterClass {
            async isEligible(context: TInfoRequestContext): Promise<boolean> {
                return (
                    (await super.isEligible(context)) &&
                    context.clocktower.isFirstNight
                );
            }
        }
    );
}

const EachNight = AtNight;

function EachNonfirstNight<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class EachNonfirstNight extends InfoRequesterClass {
        async isEligible(context: TInfoRequestContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) &&
                context.clocktower.isNonfirstNight
            );
        }
    };
}

function IsAlive<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class IsAlive extends InfoRequesterClass {
        async isEligible(context: TInfoRequestContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) &&
                context.requestedPlayer.alive
            );
        }
    };
}

class BaseDemonInformationRequester<
    TInformationRequestContext extends InformationRequestContext<DemonInformation>
> extends InformationRequester<DemonInformation, TInformationRequestContext> {
    async isEligible(context: TInformationRequestContext): Promise<boolean> {
        if ((await super.isEligible(context)) && context.players.length >= 7) {
            const isTheDemon = context.requestedPlayer.from(
                context.requestedPlayer
            ).isTheDemon;
            context.requestedPlayer.from();
            return isTheDemon;
        }

        return false;
    }
}

export const DemonInformationRequester = IsAlive(
    AtFirstNight(BaseDemonInformationRequester)
);

abstract class CharacterInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends InformationRequester<TInformation, TInformationRequestContext> {
    abstract readonly expectedCharacter: CharacterToken;

    async isEligible(context: TInformationRequestContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.requestedPlayer.character === this.expectedCharacter
        );
    }
}

class BaseWasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends CharacterInformationRequester<
    WasherwomanInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Washerwoman;
}

export const WasherwomanInformationRequester = IsAlive(
    AtFirstNight(BaseWasherwomanInformationRequester)
);

class BaseLibrarianInformationRequester<
    TInformationRequestContext extends InformationRequestContext<LibrarianInformation>
> extends CharacterInformationRequester<
    LibrarianInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Librarian;
}

export const LibrarianInformationRequester = IsAlive(
    AtFirstNight(BaseLibrarianInformationRequester)
);

class BaseInvestigatorInformationRequester<
    TInformationRequestContext extends InformationRequestContext<InvestigatorInformation>
> extends CharacterInformationRequester<
    InvestigatorInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Investigator;
}

export const InvestigatorInformationRequester = IsAlive(
    AtFirstNight(BaseInvestigatorInformationRequester)
);

class BaseChefInformationRequester<
    TInformationRequestContext extends InformationRequestContext<ChefInformation>
> extends CharacterInformationRequester<
    ChefInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Chef;
}

export const ChefInformationRequester = IsAlive(
    AtFirstNight(BaseChefInformationRequester)
);
