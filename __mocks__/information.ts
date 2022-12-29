import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue, mockWithPropertyValues } from './common';
import type { CharacterSheet } from '~/game/charactersheet';
import type { Clocktower, Diary } from '~/game/clocktower';
import type { InfoProvideContext } from '~/game/infoprovider';
import type {
    InformationRequestContext,
    IInfoRequester,
} from '~/game/inforequester';
import type {
    ChefInformation,
    DemonInformation,
    EmpathInformation,
    FortuneTellerInformation,
    InvestigatorInformation,
    LibrarianInformation,
    UndertakerInformation,
    WasherwomanInformation,
} from '~/game/information';
import type { Player } from '~/game/player';
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
    context.requestedPlayer = mockWithPropertyValues<
        Player,
        [boolean, boolean]
    >(
        ['isTheDemon', 'alive'],
        [requestedPlayerIsTheDemon, requestedPlayerIsAlive]
    );
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isFirstNight',
        isFirstNight
    );

    (context.requestedPlayer.from as jest.Mock).mockReturnValue(
        context.requestedPlayer
    );

    return context;
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

    context.requestedPlayer = mockWithPropertyValues<
        Player,
        [TCharacter, boolean]
    >(['character', 'alive'], [character, requestedPlayerIsAlive]);
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isFirstNight',
        isFirstNight
    );

    (context.requestedPlayer.from as jest.Mock).mockReturnValue(
        context.requestedPlayer
    );

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
