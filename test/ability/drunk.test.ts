import { faker } from '@faker-js/faker';
import {
    createInfoProvideContext,
    createInfoProvideContextFromPlayerDescriptions,
} from '../info-provider.test';
import {
    setupDrunkAbility,
    expectAfterDemonAttack,
    expectCharacterGetInformation,
} from './common';
import type { GetEmpathInformationAbility } from '~/game/ability/empath';
import type { EmpathInformation } from '~/game/info/provider/empath';
import {
    chooseMock,
    mockChoose,
    mockStorytellerChooseMatchingOne,
    storytellerChooseOneMock,
} from '~/__mocks__/game-ui';
import {
    mockClocktowerWithIsNonfirstNight,
    mockClocktowerForDeathAtNight,
    mockClocktowerForUndertaker,
} from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';
import type { Information } from '~/game/info/information';
import type { GetRavenkeeperInformationAbility } from '~/game/ability/ravenkeeper';
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/character-sheet';
import type { RavenkeeperInformation } from '~/game/info/provider/ravenkeeper';
import type { UndertakerInformation } from '~/game/info/provider/undertaker';
import type { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import {
    Imp,
    Drunk,
    Soldier,
    Empath,
    Saint,
    Ravenkeeper,
    Poisoner,
    FortuneTeller,
    Undertaker,
} from '~/__mocks__/character';

describe('test DrunkAbility', () => {
    /**
     * {@link `drunk["gameplay"][0]`}
     */
    test('The Drunk, who thinks they are the Soldier, is attacked by the Imp. The Drunk dies.', async () => {
        const impPlayer = await createBasicPlayer(undefined, Imp);
        const drunkPlayer = await createBasicPlayer(undefined, Drunk);

        await setupDrunkAbility(drunkPlayer, Soldier);

        await expectAfterDemonAttack(drunkPlayer, impPlayer, true);
    });

    /**
     * {@link `drunk["gameplay"][1]`}
     */
    test('The Drunk, who thinks they are the Empath, wakes and learns a "0,” even though they are sitting next to one evil player. The next night, they learn a "1.”', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Drunk,
                `${faker.name.firstName()} is the Virgin`,
                `${faker.name.firstName()} is the Drunk`,
                `${faker.name.firstName()} is the Imp`
            );

        const drunkPlayer = (await infoProvideContext.players.findByCharacter(
            Drunk
        ))!;

        const drunkAbility = await setupDrunkAbility(drunkPlayer, Empath);
        mockClocktowerWithIsNonfirstNight(infoProvideContext, true);

        mockStorytellerChooseMatchingOne(
            (information: Information<EmpathInformation>) =>
                information.info.numEvilAliveNeighbors === 0,
            3
        );

        let info = await expectCharacterGetInformation(
            drunkAbility as GetEmpathInformationAbility,
            () => infoProvideContext,
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );

        expect(info.numEvilAliveNeighbors).toBe(0);

        mockStorytellerChooseMatchingOne(
            (information: Information<EmpathInformation>) =>
                information.info.numEvilAliveNeighbors === 1,
            3
        );

        info = await expectCharacterGetInformation(
            drunkAbility as GetEmpathInformationAbility,
            () => infoProvideContext,
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );

        expect(info.numEvilAliveNeighbors).toBe(1);
        storytellerChooseOneMock.mockReset();
    });

    /**
     * {@link `drunk["gameplay"][2]`}
     */
    test('The Drunk, who thinks they are the Ravenkeeper, is killed at night. They choose the Saint, but learn that this player is the Poisoner.', async () => {
        const saintPlayer = await createBasicPlayer(undefined, Saint);
        const impPlayer = await createBasicPlayer(undefined, Imp);
        const drunkPlayer = await createBasicPlayer(undefined, Drunk);

        const infoProvideContext = createInfoProvideContext(drunkPlayer, [
            impPlayer,
            saintPlayer,
        ]);

        const drunkAbility = await setupDrunkAbility(drunkPlayer, Ravenkeeper);

        await expectAfterDemonAttack(drunkPlayer, impPlayer, true);

        mockChoose(saintPlayer);
        mockStorytellerChooseMatchingOne(
            (information: Information<RavenkeeperInformation>) =>
                information.info.character === Poisoner
        );

        const info = await expectCharacterGetInformation(
            drunkAbility as GetRavenkeeperInformationAbility,
            () => infoProvideContext,
            [
                (context) =>
                    mockClocktowerForDeathAtNight(context, drunkPlayer),
                (context) => {
                    context.characterSheet = getTroubleBrewingCharacterSheet();
                },
            ]
        );

        expect(info.character).toBe(Poisoner);
        expect(info.chosenPlayer).toBe(saintPlayer);

        storytellerChooseOneMock.mockReset();
        chooseMock.mockReset();
    });

    /**
     * {@link `drunk["gameplay"][3]`}
     */
    test('The Fortune Teller is executed. That night, the Drunk, who thinks they are Undertaker, learns that the Drunk died today.', async () => {
        const fortuneTellerPlayer = await createBasicPlayer(
            undefined,
            FortuneTeller
        );
        const drunkPlayer = await createBasicPlayer(undefined, Drunk);

        const drunkAbility = await setupDrunkAbility(drunkPlayer, Undertaker);

        mockStorytellerChooseMatchingOne(
            (information: Information<UndertakerInformation>) =>
                information.info.character === Drunk
        );

        const info = await expectCharacterGetInformation(
            drunkAbility as GetUndertakerInformationAbility,
            () => createInfoProvideContext(drunkPlayer, [fortuneTellerPlayer]),
            [
                (context) =>
                    mockClocktowerForUndertaker(
                        context,
                        true,
                        fortuneTellerPlayer
                    ),
                (context) => {
                    context.characterSheet = getTroubleBrewingCharacterSheet();
                },
            ]
        );

        expect(info.character).toBe(Drunk);
        expect(info.executedPlayer).toBe(fortuneTellerPlayer);

        storytellerChooseOneMock.mockReset();
        chooseMock.mockReset();
    });
});
