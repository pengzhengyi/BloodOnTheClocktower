import { mock } from 'jest-mock-extended';
import {
    mockObject,
    mockWithPropertyValue,
    mockWithPropertyValues,
} from './common';
import type { CharacterSheet } from '~/game/charactersheet';
import type { Clocktower, Diary } from '~/game/clocktower';
import { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { Seating } from '~/game/seating';
import type { StoryTeller } from '~/game/storyteller';
import type { TravellerSheet } from '~/game/travellersheet';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Librarian } from '~/content/characters/output/librarian';
import { Investigator } from '~/content/characters/output/investigator';
import { Chef } from '~/content/characters/output/chef';
import { Empath } from '~/content/characters/output/empath';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Spy } from '~/content/characters/output/spy';
import {
    CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from '~/game/charactertype';
import type { ChefInformation } from '~/game/info/provider/chef';
import type { DemonInformation } from '~/game/info/provider/demon';
import type { EmpathInformation } from '~/game/info/provider/empath';
import type { FortuneTellerInformation } from '~/game/info/provider/fortuneteller';
import type { InvestigatorInformation } from '~/game/info/provider/investigator';
import type { LibrarianInformation } from '~/game/info/provider/librarian';
import type { MinionInformation } from '~/game/info/provider/minion';
import type { InfoProvideContext } from '~/game/info/provider/provider';
import type { RavenkeeperInformation } from '~/game/info/provider/ravenkeeper';
import type { SpyInformation } from '~/game/info/provider/spy';
import type { TravellerInformation } from '~/game/info/provider/traveller';
import type { UndertakerInformation } from '~/game/info/provider/undertaker';
import type { WasherwomanInformation } from '~/game/info/provider/washerwoman';
import type {
    InformationRequestContext,
    IInfoRequester,
} from '~/game/info/requester/requester';

export function mockInfoProvideContext(): InfoProvideContext {
    return {
        clocktower: mock<Clocktower>(),
        characterSheet: mock<CharacterSheet>(),
        travellerSheet: mock<TravellerSheet>(),
        requestedPlayer: mock<Player>(),
        players: mock<Players>(),
        seating: mock<Seating>(),
        storyteller: mock<StoryTeller>(),
    };
}

export function mockInformationRequestContext<TInformation>(
    isStoryTellerInformation: boolean,
    willGetTrueInformation: boolean
): InformationRequestContext<TInformation> {
    return {
        ...mockInfoProvideContext(),
        requester:
            mock<
                IInfoRequester<
                    TInformation,
                    InformationRequestContext<TInformation>
                >
            >(),
        isStoryTellerInformation,
        willGetTrueInformation,
    };
}

export function mockContextForDemonInformation(
    willGetTrueInformation: boolean,
    numPlayers: number,
    requestedPlayerIsTheDemon: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<DemonInformation> {
    const context = mockInformationRequestContext<DemonInformation>(
        false,
        willGetTrueInformation
    );

    context.players = mockWithPropertyValue<Players, number>(
        'length',
        numPlayers
    );
    context.requestedPlayer = mockObject<
        Player,
        [boolean, boolean, typeof CharacterType]
    >(
        ['isDemon', 'alive', 'characterType'],
        [
            requestedPlayerIsTheDemon,
            requestedPlayerIsAlive,
            requestedPlayerIsTheDemon ? Demon : Townsfolk,
        ],
        {
            from: (mockFunction) =>
                mockFunction.mockReturnValue(context.requestedPlayer),
        }
    );
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isFirstNight',
        isFirstNight
    );

    return context;
}

export function mockContextForMinionInformation(
    willGetTrueInformation: boolean,
    numPlayers: number,
    requestedPlayerIsTheMinion: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<MinionInformation> {
    const context = mockInformationRequestContext<MinionInformation>(
        false,
        willGetTrueInformation
    );

    context.players = mockWithPropertyValue<Players, number>(
        'length',
        numPlayers
    );
    context.requestedPlayer = mockObject<
        Player,
        [boolean, boolean, typeof CharacterType]
    >(
        ['isMinion', 'alive', 'characterType'],
        [
            requestedPlayerIsTheMinion,
            requestedPlayerIsAlive,
            requestedPlayerIsTheMinion ? Minion : Outsider,
        ],
        {
            from: (mockFunction) =>
                mockFunction.mockReturnValue(context.requestedPlayer),
        }
    );

    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isFirstNight',
        isFirstNight
    );

    return context;
}

export function mockClocktowerWithIsFirstNight(
    context: { clocktower: Clocktower },
    isFirstNight: boolean
) {
    context.clocktower = mockWithPropertyValues<Clocktower, [boolean, boolean]>(
        ['isFirstNight', 'isNight'],
        [isFirstNight, isFirstNight]
    );
}

export function mockClocktowerWithIsNonfirstNight(
    context: { clocktower: Clocktower },
    isNonfirstNight: boolean
) {
    context.clocktower = mockWithPropertyValues<Clocktower, [boolean, boolean]>(
        ['isNonfirstNight', 'isNight'],
        [isNonfirstNight, isNonfirstNight]
    );
}

export function mockClocktowerForDeathAtNight(
    context: { clocktower: Clocktower },
    playerHasDied: Player
) {
    const mockHasDiedAtNight = jest.fn();
    mockHasDiedAtNight.mockImplementation((player) =>
        player.equals(playerHasDied)
    );
    const today = mockWithPropertyValue<Diary, Diary['hasDiedAtNight']>(
        'hasDiedAtNight',
        mockHasDiedAtNight
    );

    context.clocktower = mockWithPropertyValues<
        Clocktower,
        [boolean, boolean, Diary]
    >(['isNonfirstNight', 'isNight', 'today'], [true, true, today]);
}

export function mockClocktowerForUndertaker(
    context: { clocktower: Clocktower },
    isNonfirstNight: boolean,
    executedPlayer?: Player
) {
    const today = mockWithPropertyValues<Diary, [boolean, Player | undefined]>(
        ['hasExecution', 'executed'],
        [executedPlayer !== undefined, executedPlayer]
    );

    context.clocktower = mockWithPropertyValues<Clocktower, [boolean, Diary]>(
        ['isNonfirstNight', 'today'],
        [isNonfirstNight, today]
    );
}

export function mockContextForCharacterInformation<TCharacter, TInformation>(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean,
    character: TCharacter
): InformationRequestContext<TInformation> {
    const context = mockInformationRequestContext<TInformation>(
        false,
        willGetTrueInformation
    );

    const mockPlayer = mockObject<
        Player,
        [Promise<TCharacter>, boolean, boolean, boolean]
    >(
        ['character', 'alive', 'drunk', 'poisoned'],
        [Promise.resolve(character), requestedPlayerIsAlive, false, false],
        {
            from: (mockFunction) =>
                mockFunction.mockImplementation(function (this: Player) {
                    return this;
                }),
        }
    );
    context.requestedPlayer = mockPlayer;

    mockClocktowerWithIsFirstNight(context, isFirstNight);

    return context;
}

export function mockContextForWasherwomanInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<WasherwomanInformation> {
    return mockContextForCharacterInformation<
        Washerwoman,
        WasherwomanInformation
    >(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        isFirstNight,
        Washerwoman
    );
}

export function mockContextForLibrarianInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<LibrarianInformation> {
    return mockContextForCharacterInformation<Librarian, LibrarianInformation>(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        isFirstNight,
        Librarian
    );
}

export function mockContextForInvestigatorInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<InvestigatorInformation> {
    return mockContextForCharacterInformation<
        Investigator,
        InvestigatorInformation
    >(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        isFirstNight,
        Investigator
    );
}

export function mockContextForChefInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<ChefInformation> {
    return mockContextForCharacterInformation<Chef, ChefInformation>(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        isFirstNight,
        Chef
    );
}

export function mockContextForEmpathInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<EmpathInformation> {
    const context = mockContextForCharacterInformation<
        Empath,
        EmpathInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, Empath);
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isNight',
        isNight
    );
    return context;
}

export function mockContextForFortuneTellerInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<FortuneTellerInformation> {
    const context = mockContextForCharacterInformation<
        FortuneTeller,
        FortuneTellerInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, FortuneTeller);
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isNight',
        isNight
    );
    return context;
}

export function mockContextForUndertakerInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNonfirstNight: boolean,
    hasExecution: boolean
): InformationRequestContext<UndertakerInformation> {
    const context = mockContextForCharacterInformation<
        Undertaker,
        UndertakerInformation
    >(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        isNonfirstNight,
        Undertaker
    );
    const today = mockWithPropertyValue<Diary, boolean>(
        'hasExecution',
        hasExecution
    );

    context.clocktower = mockWithPropertyValues<Clocktower, [boolean, Diary]>(
        ['isNonfirstNight', 'today'],
        [isNonfirstNight, today]
    );
    return context;
}

export function mockContextForRavenkeeperInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<RavenkeeperInformation> {
    const context = mockContextForCharacterInformation<
        Ravenkeeper,
        RavenkeeperInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, Ravenkeeper);
    const today = mock<Diary>();
    (today.hasDiedAtNight as jest.Mock).mockReturnValue(
        !requestedPlayerIsAlive
    );

    context.clocktower = mockWithPropertyValues<Clocktower, [boolean, Diary]>(
        ['isNight', 'today', 'isNonfirstNight'],
        [isNight, today]
    );
    return context;
}

export function mockContextForSpyInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<SpyInformation> {
    const context = mockContextForCharacterInformation<Spy, SpyInformation>(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        isNight,
        Spy
    );
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isNight',
        isNight
    );
    return context;
}

export function mockContextForTravellerInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsTheTraveller: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean,
    isEvil: boolean
): InformationRequestContext<TravellerInformation> {
    const context = mockInformationRequestContext<TravellerInformation>(
        false,
        willGetTrueInformation
    );

    context.requestedPlayer = mockObject<
        Player,
        [boolean, boolean, boolean, typeof CharacterType]
    >(
        ['isTraveller', 'alive', 'isEvil', 'characterType'],
        [
            requestedPlayerIsTheTraveller,
            requestedPlayerIsAlive,
            isEvil,
            requestedPlayerIsTheTraveller ? Traveller : Townsfolk,
        ],
        {
            from: (mockFunction) =>
                mockFunction.mockReturnValue(context.requestedPlayer),
        }
    );

    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isFirstNight',
        isFirstNight
    );

    return context;
}
