import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { randomCharacter } from './character';
import { mockWithPropertyValue } from './common';
import { storytellerConfirmMock } from './gameui';
import { Alignment } from '~/game/alignment';
import type { CharacterToken } from '~/game/character';
import { Player } from '~/game/player';

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
    factory: () => Promise<Player> = createBasicPlayer
): Promise<Array<Player>> {
    const basicPlayerCreations: Array<Promise<Player>> = [];

    for (let i = 0; i < numPlayers; i++) {
        basicPlayerCreations.push(factory());
    }

    return await Promise.all(basicPlayerCreations);
}

export function mockPlayer() {
    return mock<Player>();
}

export function mockAlivePlayer(): Player {
    return mockWithPropertyValue('alive', true);
}

export function mockDeadPlayer(): Player {
    return mockWithPropertyValue('alive', false);
}

export async function setPlayerDead(player: Player): Promise<void> {
    storytellerConfirmMock.mockImplementationOnce((reason: string) => {
        expect(reason).toContain(Player.revokeVoteTokenDefaultPrompt);
        return Promise.resolve(true);
    });
    await player.setDead();
}
