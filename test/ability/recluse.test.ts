import { faker } from '@faker-js/faker';
import {
    createInfoProvideContextFromPlayerDescriptions,
    createUndertakerInfoProviderContext,
} from '../info-provider.test';
import {
    mockRecluseRegisterAs,
    expectAfterSlayerKill,
    expectCharacterGetInformation,
} from './common';
import { Chef } from '~/content/characters/output/chef';
import { Empath } from '~/content/characters/output/empath';
import { Imp } from '~/content/characters/output/imp';
import { Investigator } from '~/content/characters/output/investigator';
import { Recluse } from '~/content/characters/output/recluse';
import { ScarletWoman } from '~/content/characters/output/scarletwoman';
import { Slayer } from '~/content/characters/output/slayer';
import { Undertaker } from '~/content/characters/output/undertaker';
import { GetChefInformationAbility } from '~/game/ability/chef';
import { GetEmpathInformationAbility } from '~/game/ability/empath';
import { GetInvestigatorInformationAbility } from '~/game/ability/investigator';
import { SlayerAbility } from '~/game/ability/slayer';
import { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import { Minion } from '~/game/character/character-type';
import {
    mockClocktowerWithIsFirstNight,
    mockClocktowerWithIsNonfirstNight,
    mockClocktowerForUndertaker,
} from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';
import { Poisoner } from '~/content/characters/output/poisoner';

describe('test RecluseAbility', () => {
    /**
     * {@link `recluse["gameplay"][0]`}
     */
    test('The Slayer uses their ability on the Recluse . The Storyteller decides that the Recluse registers as the Imp, so the Recluse dies. The Slayer believes that they just killed the Imp.', async () => {
        const reclusePlayer = await createBasicPlayer(undefined, Recluse);
        const slayerPlayer = await createBasicPlayer(undefined, Slayer);

        await mockRecluseRegisterAs(
            reclusePlayer,
            () =>
                expectAfterSlayerKill(
                    new SlayerAbility(),
                    reclusePlayer,
                    true,
                    undefined,
                    slayerPlayer
                ),
            Imp
        );
    });

    /**
     * {@link `recluse["gameplay"][1]`}
     */
    test('The Empath, who neighbours the Recluse and the Monk, learns she is neighbouring one evil player. The next night, the Empath learns they are neighbouring no evil players.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Empath,
                `${faker.name.firstName()} is the Recluse`,
                `${faker.name.firstName()} is the Empath`,
                `${faker.name.firstName()} is the Monk`
            );

        const reclusePlayer = (await infoProvideContext.players.findByCharacter(
            Recluse
        ))!;

        const ability = new GetEmpathInformationAbility();

        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [(context) => mockClocktowerWithIsFirstNight(context, true)]
                ),
            Imp
        );

        expect(info.numEvilAliveNeighbors).toEqual(1);

        const infoNextNight = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [
                        (context) =>
                            mockClocktowerWithIsNonfirstNight(context, true),
                    ]
                ),
            Recluse,
            undefined,
            undefined,
            undefined,
            undefined,
            false
        );

        expect(infoNextNight.numEvilAliveNeighbors).toEqual(0);
    });

    /**
     * {@link `recluse["gameplay"][2]`}
     */
    test('The Investigator learns that either the Recluse or the Saint is the Scarlet Woman.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Investigator,
                `${faker.name.firstName()} is the Recluse`,
                `${faker.name.firstName()} is the Investigator`,
                `${faker.name.firstName()} is the Saint`
            );

        const reclusePlayer = (await infoProvideContext.players.findByCharacter(
            Recluse
        ))!;

        const ability = new GetInvestigatorInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [
                        (context) =>
                            mockClocktowerWithIsNonfirstNight(context, false),
                    ]
                ),
            ScarletWoman
        );

        expect(info.characterType.is(Minion)).toBeTrue();
        expect(info.character).toBe(ScarletWoman);
    });

    /**
     * {@link `recluse["gameplay"][3]`}
     */
    test('The Recluse is executed. The Undertaker learns that the Imp was executed.', async () => {
        const reclusePlayer = await createBasicPlayer(undefined, Recluse);
        const undertakerPlayer = await createBasicPlayer(undefined, Undertaker);

        const ability = new GetUndertakerInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () =>
                        createUndertakerInfoProviderContext(
                            undertakerPlayer,
                            reclusePlayer,
                            []
                        ),
                    [
                        (context) =>
                            mockClocktowerForUndertaker(
                                context,
                                true,
                                reclusePlayer
                            ),
                    ]
                ),
            Imp
        );

        expect(info.character).toBe(Imp);
        expect(info.executedPlayer).toBe(reclusePlayer);
    });

    /**
     * {@link `recluse["gameplay"][4]`}
     */
    test('The Recluse neighbours the Imp and an Evil Traveller. Because showing a "2" to the Chef might be too revealing, the Chef learns true information, a "0,” instead.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Chef,
                `${faker.name.firstName()} is the evil Scapegoat`,
                `${faker.name.firstName()} is the Recluse`,
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Chef`
            );

        const reclusePlayer = (await infoProvideContext.players.findByCharacter(
            Recluse
        ))!;

        const ability = new GetChefInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [(context) => mockClocktowerWithIsFirstNight(context, true)]
                ),
            Recluse
        );

        expect(info.numPairEvilPlayers).toEqual(0);
    });

    /**
     * {@link `investigator["gameplay"][2]`}
     */
    test('Brianna is the Recluse, and Marianna is the Imp. The Investigator learns that either Brianna or Marianna is the Poisoner. (This happens because the Recluse is registering as a Minion—in this case, the Poisoner.)', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Investigator,
                `Brianna is the Recluse`,
                `Marianna is the Imp`,
                `${faker.name.firstName()} is the Investigator`
            );

        const reclusePlayer = (await infoProvideContext.players.findByCharacter(
            Recluse
        ))!;

        const ability = new GetInvestigatorInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [(context) => mockClocktowerWithIsFirstNight(context, true)]
                ),
            Poisoner
        );

        expect(info.character).toEqual(Poisoner);
        expect(info.characterType).toEqual(Minion);
    });
});
