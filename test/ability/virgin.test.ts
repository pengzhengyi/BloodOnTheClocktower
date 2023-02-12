import { faker } from '@faker-js/faker';
import { playerFromDescription } from '../utils';
import { expectAfterNominateVirgin } from './common';
import { DeadReason } from '~/game/dead-reason';
import { DeadPlayerCannotNominate } from '~/game/exception/dead-player-cannot-nominate';
import type { VirginPlayer } from '~/game/types';
import { storytellerHandleMock } from '~/__mocks__/game-ui';

describe('test VirginAbility', () => {
    let virginPlayer: VirginPlayer;

    beforeEach(async () => {
        virginPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Virgin`
        );
    });

    /**
     * {@link `virgin["gameplay"][0]`}
     */
    test('The Washerwoman nominates the Virgin. The Washerwoman is immediately executed and the day ends.', async () => {
        const washerwomanPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Washerwoman`
        );
        expect(await washerwomanPlayer.alive).toBeTrue();

        await expectAfterNominateVirgin(washerwomanPlayer, virginPlayer);
    });

    /**
     * {@link `virgin["gameplay"][1]`}
     */
    test('The Drunk, who thinks they are the Chef, nominates the Virgin. The Drunk remains alive, and the Virgin loses their ability. Players may now vote on whether or not to execute the Virgin. (This happens because the Drunk is not a Townsfolk.)', async () => {
        const drunkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Drunk`
        );

        expect(await drunkPlayer.alive).toBeTrue();

        await expectAfterNominateVirgin(
            drunkPlayer,
            virginPlayer,
            undefined,
            undefined,
            undefined,
            false
        );
    });

    /**
     * {@link `virgin["gameplay"][2]`}
     */
    test('A dead player nominates the Virgin. The dead, however, cannot nominate. The Storyteller declares that the nomination does not count. The Virgin does not lose their ability.', async () => {
        const librarianPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Librarian`
        );
        await librarianPlayer.setDead(DeadReason.DemonAttack);
        expect(await librarianPlayer.dead).toBeTrue();

        storytellerHandleMock.mockImplementation((error) => {
            expect(error).toBeInstanceOf(DeadPlayerCannotNominate);
            return Promise.resolve(true);
        });

        expectAfterNominateVirgin(
            librarianPlayer,
            virginPlayer,
            undefined,
            undefined,
            undefined,
            true,
            true
        );

        storytellerHandleMock.mockReset();
    });
});
