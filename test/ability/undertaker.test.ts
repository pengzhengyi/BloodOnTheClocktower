import { faker } from '@faker-js/faker';
import { createInfoProvideContext } from '../info-provider.test';
import { playerFromDescription } from '../utils';
import { expectCharacterGetInformation, mockSpyRegisterAs } from './common';
import { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import { mockClocktowerForUndertaker } from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';
import { DeadReason } from '~/game/dead-reason';
import { Undertaker, Spy, Butler } from '~/__mocks__/character';
import type { IPlayer } from '~/game/player';

describe('test GetUndertakerInformationAbility', () => {
    let ability: GetUndertakerInformationAbility;
    let undertakerPlayer: IPlayer;

    beforeEach(async () => {
        ability = new GetUndertakerInformationAbility();
        undertakerPlayer = await createBasicPlayer(undefined, Undertaker);
    });

    /**
     * {@link `undertaker["gameplay"][3]`}
     */
    test('Nobody was executed today. That night, the Undertaker does not wake.', async () => {
        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(undertakerPlayer, []),
            [(context) => mockClocktowerForUndertaker(context, true, undefined)]
        );

        expect(await ability.isEligible(context)).toBeFalse();
    });

    /**
     * {@link `undertaker["gameplay"][2]`}
     */
    test('The Spy is executed. Two Travellers are exiled. That night, the Undertaker is shown the Butler token, because the Spy is registering as the Butler, and because the exiles are not executions.', async () => {
        const spyPlayer = await createBasicPlayer(undefined, Spy);
        await spyPlayer.setDead(DeadReason.Executed);
        const gunslingerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the evil Gunslinger`
        );
        await gunslingerPlayer.setDead(DeadReason.Exiled);
        const scapegoatPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the good Scapegoat`
        );
        await scapegoatPlayer.setDead(DeadReason.Exiled);

        const info = await mockSpyRegisterAs(
            spyPlayer,
            () =>
                expectCharacterGetInformation(
                    ability,
                    () =>
                        createInfoProvideContext(undertakerPlayer, [spyPlayer]),
                    [
                        (context) =>
                            mockClocktowerForUndertaker(
                                context,
                                true,
                                spyPlayer
                            ),
                    ]
                ),
            Butler
        );

        expect(info.character).toBe(Butler);
    });
});