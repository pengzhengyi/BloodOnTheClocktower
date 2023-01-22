import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { randomCharacter } from './character';
import { mockWithPropertyValue } from './common';
import { storytellerConfirmMock } from './game-ui';
import { Alignment } from '~/game/alignment';
import type { CharacterToken } from '~/game/character';
import { Player, IPlayer } from '~/game/player';
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
    return mock<IPlayer>();
}

export function mockAlivePlayer(): IPlayer {
    return mockWithPropertyValue('alive', true);
}

export function mockDeadPlayer(): IPlayer {
    return mockWithPropertyValue('alive', false);
}

export async function setPlayerDead(player: IPlayer): Promise<void> {
    storytellerConfirmMock.mockImplementationOnce((reason: string) => {
        expect(reason).toContain((Player as any).revokeVoteTokenDefaultPrompt);
        return Promise.resolve(true);
    });
    await player.setDead();
}
