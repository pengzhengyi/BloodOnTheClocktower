import { faker } from '@faker-js/faker';
import { createInfoProvideContextFromPlayerDescriptions } from '../info-provider.test';
import {
    setupDrunk,
    expectAfterDemonAttack,
    expectCharacterGetInformation,
} from './common';
import { Drunk } from '~/content/characters/output/drunk';
import { Empath } from '~/content/characters/output/empath';
import { Imp } from '~/content/characters/output/imp';
import { Soldier } from '~/content/characters/output/soldier';
import { GetEmpathInformationAbility } from '~/game/ability/empath';
import { EmpathInformation } from '~/game/info/provider/empath';
import { storytellerChooseOneMock } from '~/__mocks__/game-ui';
import { mockClocktowerWithIsNonfirstNight } from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';

describe('test DrunkAbility', () => {
    /**
     * {@link `drunk["gameplay"][0]`}
     */
    test('The Drunk, who thinks they are the Soldier, is attacked by the Imp. The Drunk dies.', async () => {
        const impPlayer = await createBasicPlayer(undefined, Imp);
        const drunkPlayer = await createBasicPlayer(undefined, Drunk);

        await setupDrunk(drunkPlayer, Soldier);

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

        storytellerChooseOneMock.mockImplementation(
            (options: Iterable<EmpathInformation>) => {
                const optionsArray = Array.from(options);
                expect(optionsArray).toHaveLength(3);
                expect(optionsArray[0].numEvilAliveNeighbors).toEqual(0);
                return Promise.resolve(optionsArray[0]);
            }
        );

        const drunkAbility = await setupDrunk(drunkPlayer, Empath);
        mockClocktowerWithIsNonfirstNight(infoProvideContext, true);

        let info = await expectCharacterGetInformation(
            drunkAbility as GetEmpathInformationAbility,
            () => infoProvideContext,
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );

        expect(info.numEvilAliveNeighbors).toBe(0);
        storytellerChooseOneMock.mockReset();

        storytellerChooseOneMock.mockImplementation(
            (options: Iterable<EmpathInformation>) => {
                const optionsArray = Array.from(options);
                expect(optionsArray).toHaveLength(3);
                expect(optionsArray[1].numEvilAliveNeighbors).toEqual(1);
                return Promise.resolve(optionsArray[1]);
            }
        );

        info = await expectCharacterGetInformation(
            drunkAbility as GetEmpathInformationAbility,
            () => infoProvideContext,
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );

        expect(info.numEvilAliveNeighbors).toBe(1);
        storytellerChooseOneMock.mockReset();
    });
});
