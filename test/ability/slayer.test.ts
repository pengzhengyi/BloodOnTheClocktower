import { faker } from '@faker-js/faker';
import { playerFromDescription } from '../utils';
import { expectAfterSlayerKill, mockRecluseRegisterAs } from './common';
import { SlayerAbility } from '~/game/ability/slayer';
import { createBasicPlayer } from '~/__mocks__/player';
import type { IPlayer } from '~/game/player';
import { Imp, Slayer } from '~/__mocks__/character';

describe('test SlayerAbility', () => {
    let ability: SlayerAbility;
    let slayerPlayer: IPlayer;

    beforeEach(async () => {
        ability = new SlayerAbility();
        slayerPlayer = await createBasicPlayer(undefined, Slayer);
    });

    /**
     * {@link `slayer["gameplay"][0]`}
     */
    test('The Slayer chooses the Imp. The Imp dies, and good wins!', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        await expectAfterSlayerKill(
            ability,
            impPlayer,
            true,
            undefined,
            slayerPlayer
        );
    });

    /**
     * {@link `slayer["gameplay"][1]`}
     */
    test('The Slayer chooses the Recluse. The Storyteller decides that the Recluse registers as the Imp, so the Recluse dies, but the game continues.', async () => {
        const reclusePlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Recluse`
        );

        await mockRecluseRegisterAs(
            reclusePlayer,
            () =>
                expectAfterSlayerKill(
                    ability,
                    reclusePlayer,
                    true,
                    undefined,
                    slayerPlayer
                ),
            Imp
        );
    });

    /**
     * {@link `slayer["gameplay"][2]`}
     */
    test('The Imp is bluffing as the Slayer. They declare that they use their Slayer ability on the Scarlet Woman. Nothing happens.', async () => {
        // TODO
    });
});
