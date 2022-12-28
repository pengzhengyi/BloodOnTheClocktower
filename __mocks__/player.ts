import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue } from './common';
import { storytellerConfirmMock } from './gameui';
import { Alignment } from '~/game/alignment';
import type { CharacterToken } from '~/game/character';
import { CharacterLoader } from '~/game/characterloader';
import { Player } from '~/game/player';

export async function createBasicPlayer(
    name?: string,
    character?: CharacterToken
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

export async function createBasicPlayers(
    numPlayers: number
): Promise<Array<Player>> {
    const basicPlayerCreations: Array<Promise<Player>> = [];

    for (let i = 0; i < numPlayers; i++) {
        basicPlayerCreations.push(createBasicPlayer());
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
    storytellerConfirmMock.mockImplementationOnce(async (reason: string) => {
        expect(reason).toContain(Player.revokeVoteTokenDefaultPrompt);
        return await true;
    });
    await player.setDead();
}
