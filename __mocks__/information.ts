import { mock } from 'jest-mock-extended';
import {
    mockObject,
    mockWithPropertyValue,
    mockWithPropertyValues,
} from './common';
import { mockGamePhaseForDay, mockGamePhaseForNight } from './game-phase';
import {
    Washerwoman,
    Librarian,
    Investigator,
    Chef,
    Empath,
    FortuneTeller,
    Undertaker,
    Ravenkeeper,
    Spy,
} from './character';
import type { ICharacterSheet } from '~/game/character/character-sheet';
import type { IPlayer } from '~/game/player/player';
import type { IClocktower } from '~/game/clocktower/clocktower';
import type { IPlayers } from '~/game/player/players';
import type { ISeating } from '~/game/seating/seating';
import type { IStoryTeller } from '~/game/storyteller';
import type { TravellerSheet } from '~/game/traveller-sheet';
import {
    type CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from '~/game/character/character-type';
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
import type { IDiary } from '~/game/clocktower/diary';
import type { IGamePhase } from '~/game/game-phase';

export function mockInfoProvideContext(): InfoProvideContext {
    return {
        clocktower: mock<IClocktower>(),
        characterSheet: mock<ICharacterSheet>(),
        travellerSheet: mock<TravellerSheet>(),
        requestedPlayer: mock<IPlayer>(),
        players: mock<IPlayers>(),
        seating: mock<ISeating>(),
        storyteller: mock<IStoryTeller>(),
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

    context.players = mockWithPropertyValue<IPlayers, number>(
        'length',
        numPlayers
    );
    context.requestedPlayer = mockObject<
        IPlayer,
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
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(!isFirstNight)
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

    context.players = mockWithPropertyValue<IPlayers, number>(
        'length',
        numPlayers
    );
    context.requestedPlayer = mockObject<
        IPlayer,
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

    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(!isFirstNight)
    );

    return context;
}

export function mockClocktowerWithIsFirstNight(
    context: { clocktower: IClocktower },
    isFirstNight: boolean
) {
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(!isFirstNight)
    );
}

export function mockClocktowerWithDay(context: { clocktower: IClocktower }) {
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForDay()
    );
}

export function mockClocktowerWithIsNonfirstNight(
    context: { clocktower: IClocktower },
    isNonfirstNight: boolean
) {
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(isNonfirstNight)
    );
}

export function mockClocktowerForDeathAtNight(
    context: { clocktower: IClocktower },
    playerHasDied: IPlayer
) {
    const mockHasDiedAtNight = jest.fn();
    mockHasDiedAtNight.mockImplementation((player) =>
        player.equals(playerHasDied)
    );
    const today = mockWithPropertyValue<IDiary, IDiary['hasDiedAtNight']>(
        'hasDiedAtNight',
        mockHasDiedAtNight
    );

    context.clocktower = mockWithPropertyValues<
        IClocktower,
        [IGamePhase, IDiary]
    >(['gamePhase', 'today'], [mockGamePhaseForNight(true), today]);
}

export function mockClocktowerForUndertaker(
    context: { clocktower: IClocktower },
    isNonfirstNight: boolean,
    executedPlayer?: IPlayer
) {
    const today = mockWithPropertyValues<
        IDiary,
        [boolean, IPlayer | undefined]
    >(
        ['hasExecution', 'executed'],
        [executedPlayer !== undefined, executedPlayer]
    );

    context.clocktower = mockWithPropertyValues<
        IClocktower,
        [IGamePhase, IDiary]
    >(['gamePhase', 'today'], [mockGamePhaseForNight(isNonfirstNight), today]);
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
        IPlayer,
        [Promise<TCharacter>, boolean, boolean, boolean]
    >(
        ['character', 'alive', 'drunk', 'poisoned'],
        [Promise.resolve(character), requestedPlayerIsAlive, false, false],
        {
            from: (mockFunction) =>
                mockFunction.mockImplementation(function (this: IPlayer) {
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
        typeof Washerwoman,
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
    return mockContextForCharacterInformation<
        typeof Librarian,
        LibrarianInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isFirstNight, Librarian);
}

export function mockContextForInvestigatorInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<InvestigatorInformation> {
    return mockContextForCharacterInformation<
        typeof Investigator,
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
    return mockContextForCharacterInformation<typeof Chef, ChefInformation>(
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
        typeof Empath,
        EmpathInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, Empath);
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(true, isNight)
    );
    return context;
}

export function mockContextForFortuneTellerInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<FortuneTellerInformation> {
    const context = mockContextForCharacterInformation<
        typeof FortuneTeller,
        FortuneTellerInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, FortuneTeller);
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(true, isNight)
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
        typeof Undertaker,
        UndertakerInformation
    >(
        willGetTrueInformation,
        requestedPlayerIsAlive,
        !isNonfirstNight,
        Undertaker
    );
    const today = mockWithPropertyValue<IDiary, boolean>(
        'hasExecution',
        hasExecution
    );

    context.clocktower = mockWithPropertyValues<
        IClocktower,
        [IGamePhase, IDiary]
    >(['gamePhase', 'today'], [mockGamePhaseForNight(isNonfirstNight), today]);
    return context;
}

export function mockContextForRavenkeeperInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<RavenkeeperInformation> {
    const context = mockContextForCharacterInformation<
        typeof Ravenkeeper,
        RavenkeeperInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, Ravenkeeper);
    const today = mock<IDiary>();
    (today.hasDiedAtNight as jest.Mock).mockReturnValue(
        !requestedPlayerIsAlive
    );

    context.clocktower = mockWithPropertyValues<
        IClocktower,
        [IGamePhase, IDiary]
    >(['gamePhase', 'today'], [mockGamePhaseForNight(true, isNight), today]);
    return context;
}

export function mockContextForSpyInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isNight: boolean
): InformationRequestContext<SpyInformation> {
    const context = mockContextForCharacterInformation<
        typeof Spy,
        SpyInformation
    >(willGetTrueInformation, requestedPlayerIsAlive, isNight, Spy);
    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(false, isNight)
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
        IPlayer,
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

    context.clocktower = mockWithPropertyValue<IClocktower, IGamePhase>(
        'gamePhase',
        mockGamePhaseForNight(!isFirstNight)
    );

    return context;
}
