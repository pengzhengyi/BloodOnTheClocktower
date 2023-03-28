import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import { mockPlayer, mockDeadPlayer } from '~/__mocks__/player';
import { mockExecution } from '~/__mocks__/execution';
import { Washerwoman } from '~/__mocks__/character';

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
        expect(await playerObj.alignment).toEqual(await player.alignment);
    });
});

describe('test Player Edge Cases', () => {
    test('Only alive players may nominate.', () => {
        const nominator = mockDeadPlayer();
        const nominated = mockPlayer();
        const execution = mockExecution();

        const nomination = nominator.nominate(nominated, execution);

        expect(nomination).toBeUndefined();
    });
});
