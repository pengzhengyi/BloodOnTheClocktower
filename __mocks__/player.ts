import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { randomCharacter } from './character';
import { mockWithPropertyValue, mockWithPropertyValues } from './common';
import { storytellerConfirmMock } from './game-ui';
import { Alignment } from '~/game/alignment';
import type { CharacterToken } from '~/game/character/character';
import { Player, type IPlayer } from '~/game/player/player';
import type { AsyncFactory } from '~/game/types';

export async function createBasicPlayer(
    name?: string,
    character?: CharacterToken
) {
    if (name === undefined) {
        name = faker.name.firstName();
    }

    if (character === undefined) {
        character = randomCharacter();
    }

    const alignment =
        character.characterType.defaultAlignment || Alignment.Neutral;

    return await Player.init(name, character, alignment);
}

export async function createUnassignedPlayer(name?: string) {
    if (name === undefined) {
        name = faker.name.firstName();
    }

    return await Player.init(name);
}

export async function createBasicPlayers(
    numPlayers: number,
    factory: AsyncFactory<IPlayer> = createBasicPlayer
): Promise<Array<IPlayer>> {
    const basicPlayerCreations: Array<Promise<IPlayer>> = [];

    for (let i = 0; i < numPlayers; i++) {
        basicPlayerCreations.push(factory());
    }

    return await Promise.all(basicPlayerCreations);
}

export function mockPlayer() {
    const player = mock<IPlayer>();
    (player as any).equals = jest.fn((otherPlayer: IPlayer) =>
        Object.is(player, otherPlayer)
    );
    return player;
}

export function mockAlivePlayer(): IPlayer {
    return mockWithPropertyValue('alive', true);
}

export function mockDeadPlayer(): IPlayer {
    return mockWithPropertyValue('alive', false);
}

export function mockPlayerWithState(
    isHealthy = true,
    isAlive = true,
    isSober = true,
    isSane = true
): IPlayer {
    const willGetTrueInformation = isSober && isHealthy;
    const willGetFalseInformation = !willGetTrueInformation;
    const hasAbility = isSober && isAlive && isHealthy;

    return mockWithPropertyValues<
        IPlayer,
        [
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>,
            Promise<boolean>
        ]
    >(
        [
            'healthy',
            'poisoned',
            'alive',
            'dead',
            'sober',
            'drunk',
            'sane',
            'mad',
            'willGetTrueInformation',
            'willGetFalseInformation',
            'hasAbility',
        ],
        [
            Promise.resolve(isHealthy),
            Promise.resolve(!isHealthy),
            Promise.resolve(isAlive),
            Promise.resolve(!isAlive),
            Promise.resolve(isSober),
            Promise.resolve(!isSober),
            Promise.resolve(isSane),
            Promise.resolve(!isSane),
            Promise.resolve(willGetTrueInformation),
            Promise.resolve(willGetFalseInformation),
            Promise.resolve(hasAbility),
        ]
    );
}

export async function setPlayerDead(player: IPlayer): Promise<void> {
    storytellerConfirmMock.mockImplementationOnce((reason: string) => {
        expect(reason).toContain(
            (Player as unknown as Record<string, unknown>)
                .revokeVoteTokenDefaultPrompt
        );
        return Promise.resolve(true);
    });
    await player.setDead();
}
