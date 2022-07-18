import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import { Washerwoman } from '~/content/characters/output/washerwoman';

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
