import { mock } from 'jest-mock-extended';
import { Player } from '~/game/player';

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
