import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue, mockWithPropertyValues } from './common';
import type { CharacterSheet } from '~/game/charactersheet';
import type { Clocktower } from '~/game/clocktower';
import type { InfoProvideContext } from '~/game/infoprovider';
import type {
    InformationRequestContext,
    IInfoRequester,
} from '~/game/inforequester';
import type {
    DemonInformation,
    WasherwomanInformation,
} from '~/game/information';
import type { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { StoryTeller } from '~/game/storyteller';
import type { TravellerSheet } from '~/game/travellersheet';
import { Washerwoman } from '~/content/characters/output/washerwoman';

export function mockInfoProvideContext(): InfoProvideContext {
    return {
        clocktower: mock<Clocktower>(),
        characterSheet: mock<CharacterSheet>(),
        travellerSheet: mock<TravellerSheet>(),
        requestedPlayer: mock<Player>(),
        players: mock<Players>(),
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

export function mockContextForWasherwomanInformation(
    willGetTrueInformation: boolean,
    requestedPlayerIsAlive: boolean,
    isFirstNight: boolean
): InformationRequestContext<WasherwomanInformation> {
    const context = mockInformationRequestContext<WasherwomanInformation>(
        false,
        willGetTrueInformation
    );

    context.requestedPlayer = mockWithPropertyValues<
        Player,
        [Washerwoman, boolean]
    >(['character', 'alive'], [Washerwoman, requestedPlayerIsAlive]);
    context.clocktower = mockWithPropertyValue<Clocktower, boolean>(
        'isFirstNight',
        isFirstNight
    );

    (context.requestedPlayer.from as jest.Mock).mockReturnValue(
        context.requestedPlayer
    );

    return context;
}
