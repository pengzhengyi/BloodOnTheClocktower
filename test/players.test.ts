import { GAME_UI, handleMock } from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { Generator } from '~/game/collections';
import { IncorrectNumberOfCharactersToAssign } from '~/game/exception';
import { Players } from '~/game/players';
import { randomCharacters } from '~/__mocks__/character';
import { createBasicPlayers, createUnassignedPlayer } from '~/__mocks__/player';

describe('test basic functionalities', () => {
    test.concurrent('get characters in player', async () => {
        const players = new Players(await createBasicPlayers(6));

        const existingCharacters = new Set(players.charactersInPlay);
        expect(
            Array.from(
                Generator.map(
                    (player) => existingCharacters.has(player.character),
                    players
                )
            )
        ).toIncludeAllMembers([true]);
    });

    test.concurrent('assign player characters', async () => {
        const players = new Players(
            await createBasicPlayers(6, createUnassignedPlayer)
        );

        const characters = Array.from(randomCharacters(6));

        for (const [i, assignmentResult] of Generator.enumerate(
            await players.assignCharacters(characters)
        )) {
            expect(assignmentResult.result).toBeTrue();
            expect(assignmentResult.character).toEqual(characters[i]);
            expect(assignmentResult.player).toEqual(
                (players as any).players[i]
            );
        }
    });
});

describe('test edge cases', () => {
    beforeAll(() => {
        handleMock.mockImplementation(async () => await false);
    });

    afterAll(() => {
        handleMock.mockReset();
    });

    test.concurrent('fewer characters than players', async () => {
        const players = new Players(
            await createBasicPlayers(4, createUnassignedPlayer)
        );

        const characters = Array.from(randomCharacters(2));

        await expect(
            async () => await players.assignCharacters(characters)
        ).rejects.toThrowError(IncorrectNumberOfCharactersToAssign);
    });

    test.concurrent('more characters than players', async () => {
        const players = new Players(
            await createBasicPlayers(2, createUnassignedPlayer)
        );

        const characters = Array.from(randomCharacters(4));

        await expect(
            async () => await players.assignCharacters(characters)
        ).rejects.toThrowError(IncorrectNumberOfCharactersToAssign);
    });
});
