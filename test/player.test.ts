import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import { mockPlayer, createBasicPlayer } from '~/__mocks__/player';
import { mockExecution } from '~/__mocks__/execution';
import { Imp, Scapegoat, Washerwoman } from '~/__mocks__/character';
import { storytellerHandleMock } from '~/__mocks__/game-ui';
import { PlayerCannotExile } from '~/game/exception/player-cannot-exile';
import { DeadReason } from '~/game/dead-reason';

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
    test('Only alive players may nominate.', async () => {
        const nominator = await createBasicPlayer(undefined, Washerwoman);
        await nominator.setDead(DeadReason.Other);
        const nominated = mockPlayer();
        const execution = mockExecution();

        const nomination = await nominator.nominate(nominated);

        if (nomination !== undefined) {
            expect(await execution.addNomination(nomination)).toBeTrue();
        } else {
            expect.fail('Unable to add nomination to execution');
        }

        expect(nomination).toBeUndefined();
    });

    test('Can only exile travellers.', async () => {
        const nominator = await createBasicPlayer();
        const traveller = await createBasicPlayer(undefined, Scapegoat);

        const exile = await nominator.exile(traveller);
        expect(exile).toBeDefined();

        const nonTraveller = await createBasicPlayer(undefined, Imp);

        storytellerHandleMock.mockImplementation((error) => {
            expect(error).toBeInstanceOf(PlayerCannotExile);
            return Promise.resolve(true);
        });
        const notApprovedExile = await nominator.exile(nonTraveller);
        storytellerHandleMock.mockReset();
        expect(notApprovedExile).toBeUndefined();
    });
});
