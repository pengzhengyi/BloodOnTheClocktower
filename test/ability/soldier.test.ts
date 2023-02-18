import { faker } from '@faker-js/faker';
import { playerFromDescription } from '../utils';
import {
    expectAfterDemonAttack,
    expectAfterPoisonerPoison,
    setupDrunkAbility,
    setupPoisonerAbility,
} from './common';
import { SoldierAbility } from '~/game/ability/soldier';
import { mockAbilitySetupContext } from '~/__mocks__/ability';
import { createBasicPlayer } from '~/__mocks__/player';
import { getTroubleBrewingNightSheet } from '~/__mocks__/night-sheet';
import { Poisoner, Drunk, Soldier } from '~/__mocks__/character';
import type { IPlayer } from '~/game/player';

describe('test SoldierAbility', () => {
    let _ability: SoldierAbility;
    let soldierPlayer: IPlayer;
    let impPlayer: IPlayer;

    beforeEach(async () => {
        soldierPlayer = await createBasicPlayer(undefined, Soldier);
        _ability = await SoldierAbility.init(
            mockAbilitySetupContext(soldierPlayer)
        );
        impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
    });

    /**
     * {@link `soldier["gameplay"][0]`}
     */
    test('The Imp attacks the Soldier. The Soldier does not die, so nobody dies that night.', async () => {
        await expectAfterDemonAttack(soldierPlayer, impPlayer, false);
    });

    /**
     * {@link `soldier["gameplay"][1]`}
     */
    test('The Poisoner poisons the Soldier, then the Imp attacks the Soldier. The Soldier dies, since they have no ability.', async () => {
        const poisonerPlayer = await createBasicPlayer(undefined, Poisoner);
        const poisonerAbility = await setupPoisonerAbility(
            poisonerPlayer,
            undefined,
            await getTroubleBrewingNightSheet()
        );

        await expectAfterPoisonerPoison(
            poisonerAbility,
            soldierPlayer,
            true,
            undefined,
            poisonerPlayer
        );
        await expectAfterDemonAttack(soldierPlayer, impPlayer, true);
    });

    /**
     * {@link `soldier["gameplay"][2]`}
     */
    test('The Imp attacks the Soldier. The Soldier dies, because they are actually the Drunk.', async () => {
        const drunkPlayer = await createBasicPlayer(undefined, Drunk);

        const _drunkAbility = await setupDrunkAbility(drunkPlayer, Soldier);

        await expectAfterDemonAttack(drunkPlayer, impPlayer, true);
    });
});
