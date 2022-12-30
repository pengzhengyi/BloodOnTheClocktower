import { CharacterType, Demon, Minion, Traveller } from './charactertype';
import type { CharacterToken } from './character';
import type { InfoProvideContext } from './infoprovider';
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

function IsEvil<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequesterConstructor extends InfoRequesterConstructor<
        InfoRequester<TInformation, TInfoRequestContext>
    >
>(InfoRequesterClass: TInfoRequesterConstructor) {
    return class IsEvil extends InfoRequesterClass {
        async isEligible(context: TInfoRequestContext): Promise<boolean> {
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
        async isEligible(context: TInfoRequestContext): Promise<boolean> {
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

    async isEligible(context: TInformationRequestContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.requestedPlayer.characterType.is(this.expectedCharacterType)
        );
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

class BaseEmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends CharacterInformationRequester<
    EmpathInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Empath;
}

export const EmpathInformationRequester = IsAlive(
    EachNight(BaseEmpathInformationRequester)
);

class BaseFortuneTellerInformationRequester<
    TInformationRequestContext extends InformationRequestContext<FortuneTellerInformation>
> extends CharacterInformationRequester<
    FortuneTellerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = FortuneTeller;
}

export const FortuneTellerInformationRequester = IsAlive(
    EachNight(BaseFortuneTellerInformationRequester)
);

class BaseUndertakerInformationRequester<
    TInformationRequestContext extends InformationRequestContext<UndertakerInformation>
> extends CharacterInformationRequester<
    UndertakerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Undertaker;

    async isEligible(context: TInformationRequestContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.clocktower.today.hasExecution
        );
    }
}

export const UndertakerInformationRequester = IsAlive(
    EachNonfirstNight(BaseUndertakerInformationRequester)
);

class BaseRavenkeeperInformationRequester<
    TInformationRequestContext extends InformationRequestContext<RavenkeeperInformation>
> extends CharacterInformationRequester<
    RavenkeeperInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Ravenkeeper;

    async isEligible(context: TInformationRequestContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) && this.hasDiedAtNight(context)
        );
    }

    protected hasDiedAtNight(context: TInformationRequestContext): boolean {
        if (context.clocktower.isNight) {
            return context.clocktower.today.hasDead(context.requestedPlayer);
        }

        return false;
    }
}

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
