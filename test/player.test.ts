import { GAME_UI } from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));
import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { mockPlayer, mockDeadPlayer } from '~/__mocks__/player';
import { mockExecution } from '~/__mocks__/execution';
import { Nomination } from '~/game/nomination';

describe('test Player serialization', () => {
    test.concurrent('convert to object', async () => {
        const name = faker.name.firstName();
        const player = await playerFromDescription(
            `${name} is the Washerwoman`
        );
        const playerObj = player.toJSON();

        expect(playerObj.username).toEqualCaseInsensitive(player.username);
        expect(playerObj.id).toEqualCaseInsensitive(player.id);
        expect(playerObj.character).toEqualCaseInsensitive(Washerwoman.id);
        expect(playerObj.alignment).toEqual(player.alignment);
    });
});

describe('test Player Edge Cases', () => {
    test('Only alive players may nominate.', () => {
        const nominator = mockDeadPlayer();
        const nominated = mockPlayer();
        const execution = mockExecution();

        expect(nominator.nominate(nominated, execution)).not.toBeInstanceOf(
            Nomination
        );
    });
});
