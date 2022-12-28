import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue, mockWithPropertyValues } from './common';
import type { CharacterSheet } from '~/game/charactersheet';
import { Clocktower } from '~/game/clocktower';
import type { InfoProvideContext } from '~/game/infoprovider';
import type {
    InformationRequestContext,
    IInfoRequester,
} from '~/game/inforequester';
import { DemonInformation } from '~/game/information';
import type { Player } from '~/game/player';
import { Players } from '~/game/players';
import type { StoryTeller } from '~/game/storyteller';
import type { TravellerSheet } from '~/game/travellersheet';

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
