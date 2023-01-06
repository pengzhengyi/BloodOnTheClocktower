import { handleMock } from '~/__mocks__/gameui';
import { randomChoice } from '~/game/common';
import { Alignment } from '~/game/alignment';
import { Generator } from '~/game/collections';
import {
    IncorrectNumberOfCharactersToAssign,
    PlayerHasUnclearAlignment,
} from '~/game/exception';
import { Players } from '~/game/players';
import type { CharacterToken, TravellerCharacterToken } from '~/game/character';
import { randomCharacters } from '~/__mocks__/character';
import { createBasicPlayers, createUnassignedPlayer } from '~/__mocks__/player';

export function createRandomCharactersAndOptionalAlignmentForTraveller(
    numCharacters: number
): [Array<CharacterToken>, Map<TravellerCharacterToken, Alignment>] {
    const characters = Array.from(randomCharacters(numCharacters));
    const travellerToAlignment = new Map(
        Generator.map(
            (traveller) => [
                traveller,
                randomChoice([
                    Alignment.Good,
                    Alignment.Evil,
                    Alignment.Neutral,
                ]),
            ],
            Generator.filter((character) => character.isTraveller, characters)
        )
    );

    return [characters, travellerToAlignment];
}

describe('test basic functionalities', () => {
    beforeAll(() => {
        handleMock.mockImplementation((error) => {
            expect(error).toBeInstanceOf(PlayerHasUnclearAlignment);
            (error as PlayerHasUnclearAlignment).correctedAlignment =
                randomChoice([
                    Alignment.Good,
                    Alignment.Evil,
                    Alignment.Neutral,
                ]);
            return Promise.resolve(error);
        });
    });

    afterAll(() => {
        handleMock.mockReset();
    });

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

        const [characters, travellerToAlignment] =
            createRandomCharactersAndOptionalAlignmentForTraveller(6);

        for (const [i, assignmentResult] of Generator.enumerate(
            await players.assignCharacters(characters, travellerToAlignment)
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
        handleMock.mockImplementation(() => Promise.resolve(false));
    });

    afterAll(() => {
        handleMock.mockReset();
    });

    test.concurrent('fewer characters than players', async () => {
        const players = new Players(
            await createBasicPlayers(4, createUnassignedPlayer)
        );

        const [characters, travellerToAlignment] =
            createRandomCharactersAndOptionalAlignmentForTraveller(2);

        await expect(
            async () =>
                await players.assignCharacters(characters, travellerToAlignment)
        ).rejects.toThrowError(IncorrectNumberOfCharactersToAssign);
    });

    test.concurrent('more characters than players', async () => {
        const players = new Players(
            await createBasicPlayers(2, createUnassignedPlayer)
        );

        const [characters, travellerToAlignment] =
            createRandomCharactersAndOptionalAlignmentForTraveller(4);

        await expect(
            async () =>
                await players.assignCharacters(characters, travellerToAlignment)
        ).rejects.toThrowError(IncorrectNumberOfCharactersToAssign);
    });
});
