import { faker } from '@faker-js/faker';
import { playerFromDescription } from '../utils';
import { expectDieInsteadAfterDemonAttack } from './common';
import { Mayor } from '~/content/characters/output/mayor';
import { MayorAbility } from '~/game/ability/mayor';
import type { MayorPlayer } from '~/game/types';
import { mockMayorAbilitySetupContext } from '~/__mocks__/ability';
import { createBasicPlayer } from '~/__mocks__/player';
import { getTroubleBrewingNightSheet } from '~/__mocks__/night-sheet';

describe('test MayorAbility', () => {
    let mayorPlayer: MayorPlayer;

    beforeEach(async () => {
        mayorPlayer = await createBasicPlayer(undefined, Mayor);
    });

    /**
     * {@link `mayor["gameplay"][0]`}
     */
    test('The Imp attacks the Mayor. The Storyteller chooses that the Ravenkeeper dies instead.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const ravenkeeperPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Ravenkeeper`
        );

        const context = mockMayorAbilitySetupContext(
            mayorPlayer,
            undefined,
            undefined,
            await getTroubleBrewingNightSheet()
        );
        const mayorAbility = await MayorAbility.init(context);

        expect(await mayorAbility.isEligible(context)).toBeTrue();

        await expectDieInsteadAfterDemonAttack(
            mayorPlayer,
            impPlayer,
            ravenkeeperPlayer
        );
    });

    /**
     * {@link `mayor["gameplay"][1]`}
     */
    test('There are three players alive. There are no nominations for execution today. Good wins.', async () => {
        // const game = createBasicGame();
        // const context = mockMayorAbilitySetupContext(
        //     mayorPlayer,
        //     undefined,
        //     game,
        //     troubleBrewingNightSheet
        // );
        // await MayorAbility.init(context);
        // const winningTeam = game.getWinningTeam([mayorPlayer])
        // expect(winningTeam).toBe(Alignment.Good);
        // TODO
    });

    /**
     * {@link `mayor["gameplay"][2]`}
     */
    test('There are five players alive, including two Travellers. Both Travellers are exiled, and the vote is tied between the remaining players. Because a tied vote means neither player is executed, good wins.', async () => {
        // TODO
    });
});
