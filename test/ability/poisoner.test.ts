import { faker } from '@faker-js/faker';
import {
    createInfoProvideContext,
    createInfoProvideContextFromPlayerDescriptions,
} from '../info-provider.test';
import {
    expectCharacterGetInformation,
    expectAfterPoisonerPoison,
    expectAfterSlayerKill,
    expectUndertakerToLearn,
    expectAfterExecuteSaint,
    setupPoisonerAbility,
} from './common';
import { PoisonerAbility } from '~/game/ability/poisoner';
import { SlayerAbility } from '~/game/ability/slayer';
import { mockPoisonerAbilitySetupContext } from '~/__mocks__/ability';
import { getTroubleBrewingNightSheet } from '~/__mocks__/night-sheet';
import { createBasicPlayer } from '~/__mocks__/player';
import { GetEmpathInformationAbility } from '~/game/ability/empath';
import { Clocktower } from '~/game/clocktower/clocktower';
import { Phase } from '~/game/phase';
import { clocktowerAdvanceToDateAndPhase } from '~/__mocks__/clocktower';
import {
    mockStorytellerChooseFirstOne,
    mockStorytellerChooseMatchingOne,
    storytellerChooseOneMock,
} from '~/__mocks__/game-ui';
import type { Information } from '~/game/info/information';
import type { EmpathInformation } from '~/game/info/provider/empath';
import { GetInvestigatorInformationAbility } from '~/game/ability/investigator';
import { mockClocktowerWithIsFirstNight } from '~/__mocks__/information';
import { Minion } from '~/game/character/character-type';
import type { InvestigatorInformation } from '~/game/info/provider/investigator';
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/character-sheet';
import { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import type { UndertakerInformation } from '~/game/info/provider/undertaker';
import { Execution } from '~/game/voting/execution';
import {
    Poisoner,
    Slayer,
    Imp,
    Empath,
    Investigator,
    Baron,
    Undertaker,
    Saint,
    Virgin,
} from '~/__mocks__/character';

describe('test PoisonerAbility', () => {
    /**
     * {@link `poisoner["gameplay"][0]`}
     */
    test('During the night, the Poisoner poisons the Slayer. The next day, the Slayer tries to slay the Imp. Nothing happens. The Slayer now has no ability.', async () => {
        const poisonerPlayer = await createBasicPlayer(undefined, Poisoner);
        const slayerPlayer = await createBasicPlayer(undefined, Slayer);
        const impPlayer = await createBasicPlayer(undefined, Imp);

        const poisonerAbility = await setupPoisonerAbility(
            poisonerPlayer,
            undefined,
            await getTroubleBrewingNightSheet()
        );

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

    /**
     * {@link `poisoner["gameplay"][1]`}
     */
    test('The poisoned Empath, who neighbours two evil players, learns a "0.” The next night, the Empath, no longer poisoned, learns the correct information: a "2.”', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Empath,
                `${faker.name.firstName()} is the Poisoner`,
                `${faker.name.firstName()} is the Empath`,
                `${faker.name.firstName()} is the Imp`
            );

        const poisonerPlayer =
            (await infoProvideContext.players.findByCharacter(Poisoner))!;
        const empathPlayer = (await infoProvideContext.players.findByCharacter(
            Empath
        ))!;

        const clocktower = new Clocktower();
        await clocktowerAdvanceToDateAndPhase(clocktower, 0, Phase.Night);

        const poisonerAbility = await setupPoisonerAbility(
            poisonerPlayer,
            undefined,
            await getTroubleBrewingNightSheet(),
            clocktower
        );

        await expectAfterPoisonerPoison(
            poisonerAbility,
            empathPlayer,
            true,
            undefined,
            poisonerPlayer
        );
        const empathAbility = new GetEmpathInformationAbility();

        mockStorytellerChooseMatchingOne(
            (information: Information<EmpathInformation>) =>
                information.info.numEvilAliveNeighbors === 0,
            3
        );

        const falseInformation = await expectCharacterGetInformation(
            empathAbility,
            () => infoProvideContext,
            [
                (context) => {
                    context.clocktower = clocktower;
                },
            ],
            undefined
        );
        expect(falseInformation.numEvilAliveNeighbors).toBe(0);

        await clocktowerAdvanceToDateAndPhase(clocktower, 1, Phase.Night);
        mockStorytellerChooseFirstOne();

        const trueInformation = await expectCharacterGetInformation(
            empathAbility,
            () => infoProvideContext,
            [
                (context) => {
                    context.clocktower = clocktower;
                },
            ],
            undefined
        );
        expect(trueInformation.numEvilAliveNeighbors).toBe(2);

        storytellerChooseOneMock.mockReset();
    });

    /**
     * {@link `poisoner["gameplay"][2]`}
     */
    test('The Investigator is poisoned. They learn that one of two players is the Baron, even though neither is a Minion. (Or even the right players, but the wrong Minion type.)', async () => {
        const investigatorPlayer = await createBasicPlayer(
            undefined,
            Investigator
        );
        const poisonerPlayer = await createBasicPlayer(undefined, Poisoner);
        const slayerPlayer = await createBasicPlayer(undefined, Slayer);
        const empathPlayer = await createBasicPlayer(undefined, Empath);

        const infoProvideContext = createInfoProvideContext(
            investigatorPlayer,
            [poisonerPlayer, empathPlayer, slayerPlayer]
        );
        infoProvideContext.characterSheet = getTroubleBrewingCharacterSheet();

        const poisonerAbility = await setupPoisonerAbility(
            poisonerPlayer,
            undefined,
            await getTroubleBrewingNightSheet()
        );

        await expectAfterPoisonerPoison(
            poisonerAbility,
            investigatorPlayer,
            true,
            undefined,
            poisonerPlayer
        );

        mockStorytellerChooseMatchingOne(
            (information: Information<InvestigatorInformation>) =>
                information.info.character === Baron &&
                information.info.players.includes(empathPlayer) &&
                information.info.players.includes(slayerPlayer)
        );
        const falseInformation = await expectCharacterGetInformation(
            new GetInvestigatorInformationAbility(),
            () => infoProvideContext,
            [(context) => mockClocktowerWithIsFirstNight(context, true)],
            undefined
        );

        expect(falseInformation.character).toBe(Baron);
        expect(falseInformation.characterType).toBe(Minion);
        expect(falseInformation.players).toIncludeSameMembers([
            empathPlayer,
            slayerPlayer,
        ]);
    });

    /**
     * {@link `poisoner["gameplay"][3]`}
     */
    test('The Undertaker is poisoned. Even though the Imp died today, they learn that the Virgin died. A few days later, a poisoned Saint dies, and the game continues.', async () => {
        const poisonerPlayer = await createBasicPlayer(undefined, Poisoner);
        const undertakerPlayer = await createBasicPlayer(undefined, Undertaker);
        const saintPlayer = await createBasicPlayer(undefined, Saint);
        const impPlayer = await createBasicPlayer(undefined, Imp);

        const undertakerAbility = new GetUndertakerInformationAbility();

        const poisonerAbility = new PoisonerAbility();

        const clocktower = new Clocktower();
        const setupContext = mockPoisonerAbilitySetupContext(
            poisonerPlayer,
            await getTroubleBrewingNightSheet(),
            clocktower
        );
        await poisonerAbility.setup(setupContext);

        await clocktowerAdvanceToDateAndPhase(clocktower, 0, Phase.Night);

        await expectAfterPoisonerPoison(
            poisonerAbility,
            undertakerPlayer,
            true,
            undefined,
            poisonerPlayer
        );

        mockStorytellerChooseMatchingOne(
            (information: Information<UndertakerInformation>) =>
                information.info.character === Virgin
        );
        await expectUndertakerToLearn(
            undertakerAbility,
            impPlayer,
            Virgin,
            undefined,
            undertakerPlayer,
            getTroubleBrewingCharacterSheet()
        );
        storytellerChooseOneMock.mockReset();

        await clocktowerAdvanceToDateAndPhase(clocktower, 3, Phase.Night);

        // poisoned saint
        await expectAfterPoisonerPoison(
            poisonerAbility,
            saintPlayer,
            true,
            undefined,
            poisonerPlayer
        );

        const execution = Execution.init();
        await expectAfterExecuteSaint(
            execution,
            saintPlayer,
            false,
            undefined,
            undefined,
            12,
            undefined,
            undefined,
            true
        );
    });

    /**
     * {@link `poisoner["gameplay"][4]`}
     */
    test('The Poisoner poisons the Mayor, then becomes the Imp. The Mayor is no longer poisoned because there is no Poisoner in play.', async () => {
        // TODO need to implement imp ability
    });
});
