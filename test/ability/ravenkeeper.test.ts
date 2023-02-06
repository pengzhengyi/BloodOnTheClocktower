import { faker } from '@faker-js/faker';
import { createInfoProvideContext } from '../info-provider.test';
import { playerFromDescription } from '../utils';
import {
    expectDieInsteadAfterDemonAttack,
    mockRecluseRegisterAs,
} from './common';
import { ScarletWoman } from '~/content/characters/output/scarletwoman';
import { type GetInformationAbilityUseResult } from '~/game/ability/ability';
import { MayorAbility } from '~/game/ability/mayor';
import { GetRavenkeeperInformationAbility } from '~/game/ability/ravenkeeper';
import { AbilitySuccessCommunicatedInfo } from '~/game/ability/status';
import { DeadReason } from '~/game/dead-reason';
import type { RavenkeeperInformation } from '~/game/info/provider/ravenkeeper';
import {
    mockGetInfoAbilityUseContext,
    mockMayorAbilitySetupContext,
} from '~/__mocks__/ability';
import { chooseMock, sendMock } from '~/__mocks__/game-ui';
import { mockClocktowerForDeathAtNight } from '~/__mocks__/information';
import { getTroubleBrewingNightSheet } from '~/__mocks__/night-sheet';
import { createBasicStoryTeller } from '~/__mocks__/storyteller';

describe('test GetRavenkeeperInformationAbility', () => {
    /**
     * {@link `ravenkeeper["gameplay"][1]`}
     */
    test("The Imp attacks the Mayor. The Mayor doesn't die, but the Ravenkeeper dies instead, due to the Mayor's ability. The Ravenkeeper is woken and chooses Douglas, who is a dead Recluse. The Ravenkeeper learns that Douglas is the Scarlet Woman, since the Recluse registered as a Minion.", async () => {
        const mayorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Mayor`
        );
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const ravenkeeperPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Ravenkeeper`
        );
        const Douglas = await playerFromDescription(
            `${faker.name.firstName()} is the Recluse`
        );
        await Douglas.setDead(DeadReason.Other);

        const context = mockGetInfoAbilityUseContext(
            () =>
                createInfoProvideContext(ravenkeeperPlayer, [
                    impPlayer,
                    mayorPlayer,
                    Douglas,
                ]),
            [
                (context) =>
                    mockClocktowerForDeathAtNight(context, ravenkeeperPlayer),
            ]
        );
        const setupContext = mockMayorAbilitySetupContext(
            mayorPlayer,
            context.players,
            undefined,
            await getTroubleBrewingNightSheet()
        );
        const mayorAbility = await MayorAbility.init(setupContext);
        expect(await mayorAbility.isEligible(context)).toBeTrue();

        context.storyteller = createBasicStoryTeller();
        await expectDieInsteadAfterDemonAttack(
            mayorPlayer,
            impPlayer,
            ravenkeeperPlayer
        );

        const ravenKeeperAbility = await GetRavenkeeperInformationAbility.init(
            setupContext
        );
        expect(await ravenKeeperAbility.isEligible(context)).toBeTrue();

        chooseMock.mockResolvedValue(Douglas);
        const result = (await mockRecluseRegisterAs(
            Douglas,
            () => ravenKeeperAbility.use(context),
            ScarletWoman
        )) as GetInformationAbilityUseResult<RavenkeeperInformation>;

        chooseMock.mockReset();

        expect(result.status).toEqual(AbilitySuccessCommunicatedInfo);
        expect(sendMock).toHaveBeenCalled();
        sendMock.mockClear();
        expect(result.isTrueInformation).toBeTrue();
        expect(result.info?.info?.chosenPlayer).toBe(Douglas);
        expect(result.info?.info?.character).toBe(ScarletWoman);
    });
});