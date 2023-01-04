/* eslint-disable @typescript-eslint/no-redeclare */
import { CharacterType, Demon, Minion, Traveller } from './charactertype';
import type { CharacterToken } from './character';
import type {
    FortuneTellerInformationProviderContext,
    InfoProvideContext,
    RavenkeeperInformationProviderContext,
    UndertakerInformationProviderContext,
} from './infoprovider';
import type {
    ChefInformation,
    DemonInformation,
    EmpathInformation,
    FortuneTellerInformation,
    Info,
    Information,
    InvestigatorInformation,
    LibrarianInformation,
    MinionInformation,
    RavenkeeperInformation,
    SpyInformation,
    StoryTellerInformation,
    TravellerInformation,
    UndertakerInformation,
    WasherwomanInformation,
} from './information';
import type { Constructor } from './types';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Librarian } from '~/content/characters/output/librarian';
import { Investigator } from '~/content/characters/output/investigator';
import { Chef } from '~/content/characters/output/chef';
import { Empath } from '~/content/characters/output/empath';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Spy } from '~/content/characters/output/spy';

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
    isEligible(context: InfoProvideContext): Promise<boolean>;

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

    isEligible(_context: InfoProvideContext): Promise<boolean> {
        return Promise.resolve(true);
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
    willGetTrueInformation(context: InfoProvideContext): Promise<boolean>;

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
    willGetTrueInformation(context: InfoProvideContext): Promise<boolean> {
        return Promise.resolve(
            !context.requestedPlayer.drunk && !context.requestedPlayer.poisoned
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

type InfoRequesterConstructor<TInfoRequester> = Constructor<TInfoRequester>;

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

function AtNight<
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
            async isEligible(context: InfoProvideContext): Promise<boolean> {
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
        async isEligible(context: InfoProvideContext): Promise<boolean> {
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
        async isEligible(context: InfoProvideContext): Promise<boolean> {
            return (
                (await super.isEligible(context)) &&
                context.requestedPlayer.alive
            );
        }
    };
}

function IsEvil<
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
                context.requestedPlayer.isEvil
            );
        }
    };
}

function hasEnoughPlayerForDemonMinionInformation<
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

abstract class CharacterTypeInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends InformationRequester<TInformation, TInformationRequestContext> {
    abstract readonly expectedCharacterType: typeof CharacterType;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.requestedPlayer.characterType.is(this.expectedCharacterType)
        );
    }

    toString() {
        return `RequestInfoAs${this.expectedCharacterType}`;
    }
}

class BaseDemonInformationRequester<
    TInformationRequestContext extends InformationRequestContext<DemonInformation>
> extends CharacterTypeInformationRequester<
    DemonInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Demon;
}

export const DemonInformationRequester = IsAlive(
    hasEnoughPlayerForDemonMinionInformation(
        AtFirstNight(BaseDemonInformationRequester)
    )
);

class BaseMinionInformationRequester<
    TInformationRequestContext extends InformationRequestContext<MinionInformation>
> extends CharacterTypeInformationRequester<
    MinionInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Minion;
}

export const MinionInformationRequester = IsAlive(
    hasEnoughPlayerForDemonMinionInformation(
        AtFirstNight(BaseMinionInformationRequester)
    )
);

abstract class CharacterInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends InformationRequester<TInformation, TInformationRequestContext> {
    abstract readonly expectedCharacter: CharacterToken;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.requestedPlayer.character === this.expectedCharacter
        );
    }

    toString() {
        return `RequestInfoAs${this.expectedCharacter}`;
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

export interface WasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends BaseWasherwomanInformationRequester<TInformationRequestContext> {}

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

export interface LibrarianInformationRequester<
    TInformationRequestContext extends InformationRequestContext<LibrarianInformation>
> extends BaseLibrarianInformationRequester<TInformationRequestContext> {}

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

export interface InvestigatorInformationRequester<
    TInformationRequestContext extends InformationRequestContext<InvestigatorInformation>
> extends BaseInvestigatorInformationRequester<TInformationRequestContext> {}

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

export interface ChefInformationRequester<
    TInformationRequestContext extends InformationRequestContext<ChefInformation>
> extends BaseChefInformationRequester<TInformationRequestContext> {}

export const ChefInformationRequester = IsAlive(
    AtFirstNight(BaseChefInformationRequester)
);

class BaseEmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends CharacterInformationRequester<
    EmpathInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Empath;
}

export interface EmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends BaseEmpathInformationRequester<TInformationRequestContext> {}

export const EmpathInformationRequester = IsAlive(
    EachNight(BaseEmpathInformationRequester)
);

export interface FortuneTellerInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        FortuneTellerInformationProviderContext {}

class BaseFortuneTellerInformationRequester<
    TInformationRequestContext extends FortuneTellerInformationRequestContext<FortuneTellerInformation>
> extends CharacterInformationRequester<
    FortuneTellerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = FortuneTeller;
}

export interface FortuneTellerInformationRequester<
    TInformationRequestContext extends FortuneTellerInformationRequestContext<FortuneTellerInformation>
> extends BaseFortuneTellerInformationRequester<TInformationRequestContext> {}

export const FortuneTellerInformationRequester = IsAlive(
    EachNight(BaseFortuneTellerInformationRequester)
);

export interface UndertakerInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        UndertakerInformationProviderContext {}

class BaseUndertakerInformationRequester<
    TInformationRequestContext extends UndertakerInformationRequestContext<UndertakerInformation>
> extends CharacterInformationRequester<
    UndertakerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Undertaker;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.clocktower.today.hasExecution
        );
    }
}

export interface UndertakerInformationRequester<
    TInformationRequestContext extends UndertakerInformationRequestContext<UndertakerInformation>
> extends BaseUndertakerInformationRequester<TInformationRequestContext> {}

export const UndertakerInformationRequester = IsAlive(
    EachNonfirstNight(BaseUndertakerInformationRequester)
);

export interface RavenkeeperInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        RavenkeeperInformationProviderContext {}

class BaseRavenkeeperInformationRequester<
    TInformationRequestContext extends RavenkeeperInformationRequestContext<RavenkeeperInformation>
> extends CharacterInformationRequester<
    RavenkeeperInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Ravenkeeper;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) && this.hasDiedAtNight(context)
        );
    }

    protected hasDiedAtNight(context: InfoProvideContext): boolean {
        if (context.clocktower.isNight) {
            return context.clocktower.today.hasDead(context.requestedPlayer);
        }

        return false;
    }
}

export interface RavenkeeperInformationRequester<
    TInformationRequestContext extends RavenkeeperInformationRequestContext<RavenkeeperInformation>
> extends BaseRavenkeeperInformationRequester<TInformationRequestContext> {}

export const RavenkeeperInformationRequester = OnceAtNight(
    BaseRavenkeeperInformationRequester
);

class BaseSpyInformationRequester<
    TInformationRequestContext extends InformationRequestContext<SpyInformation>
> extends CharacterInformationRequester<
    SpyInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Spy;
}

export const SpyInformationRequester = EachNight(
    IsAlive(BaseSpyInformationRequester)
);

class BaseTravellerInformationRequester<
    TInformationRequestContext extends InformationRequestContext<TravellerInformation>
> extends CharacterTypeInformationRequester<
    TravellerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Traveller;
}

export const TravellerInformationRequester = AtFirstNight(
    IsEvil(IsAlive(BaseTravellerInformationRequester))
);
