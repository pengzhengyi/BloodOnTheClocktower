import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { Alignment } from '~/game/alignment';
import { Character } from '~/game/character';
import { CharacterLoader } from '~/game/characterloader';
import { Player } from '~/game/player';

export async function createBasicPlayer(
    name?: string,
    character?: typeof Character
) {
    if (name === undefined) {
        name = faker.name.firstName();
    }

    if (character === undefined) {
        character = CharacterLoader.randomLoad();
    }

    const alignment =
        character.characterType.defaultAlignment || Alignment.Neutral;

    return await Player.init(name, character, alignment);
}

export function mockPlayer() {
    return mock<Player>();
}

export function mockPlayerWithGetter<T, Y extends any[]>(
    propertyName: string,
    mockFunction: jest.Mock<T, Y>
): Player {
    const baseMock = {};
    const player = mock<Player>();
    Object.defineProperty(baseMock, propertyName, { get: mockFunction });
    return player;
}

export function mockPlayerWithPropertyValue<T>(
    propertyName: string,
    propertyValue: T
): Player {
    const mockGetter = jest.fn<T, []>();
    mockGetter.mockReturnValue(propertyValue);
    return mockPlayerWithGetter(propertyName, mockGetter);
}

export function mockDeadPlayer(): Player {
    return mockPlayerWithPropertyValue('alive', 'false');
}
