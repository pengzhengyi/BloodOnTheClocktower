import { expectAfterPoisonerPoison, expectAfterSlayerKill } from './common';
import { Imp } from '~/content/characters/output/imp';
import { Poisoner } from '~/content/characters/output/poisoner';
import { Slayer } from '~/content/characters/output/slayer';
import { PoisonerAbility } from '~/game/ability/poisoner';
import { SlayerAbility } from '~/game/ability/slayer';
import { mockPoisonerAbilitySetupContext } from '~/__mocks__/ability';
import { getTroubleBrewingNightSheet } from '~/__mocks__/night-sheet';
import { createBasicPlayer } from '~/__mocks__/player';

describe('test PoisonerAbility', () => {
    /**
     * {@link `poisoner["gameplay"][0]`}
     */
    test('During the night, the Poisoner poisons the Slayer. The next day, the Slayer tries to slay the Imp. Nothing happens. The Slayer now has no ability.', async () => {
        const poisonerPlayer = await createBasicPlayer(undefined, Poisoner);
        const slayerPlayer = await createBasicPlayer(undefined, Slayer);
        const impPlayer = await createBasicPlayer(undefined, Imp);

        const poisonerAbility = new PoisonerAbility();

        const setupContext = mockPoisonerAbilitySetupContext(
            poisonerPlayer,
            await getTroubleBrewingNightSheet()
        );
        await poisonerAbility.setup(setupContext);

        await expectAfterPoisonerPoison(
            poisonerAbility,
            slayerPlayer,
            true,
            undefined,
            poisonerPlayer
        );

        const slayerAbility = new SlayerAbility();

        await expectAfterSlayerKill(
            slayerAbility,
            impPlayer,
            false,
            undefined,
            slayerPlayer
        );
    });
});
