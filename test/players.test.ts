import { Generator } from '~/game/collections';
import { Players } from '~/game/players';
import { createBasicPlayers } from '~/__mocks__/player';

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
});
