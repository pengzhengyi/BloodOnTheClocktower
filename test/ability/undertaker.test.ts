import { createInfoProvideContext } from '../info-provider.test';
import { Undertaker } from '~/content/characters/output/undertaker';
import { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import { mockClocktowerForUndertaker } from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';

describe('test GetUndertakerInformationAbility', () => {
    let ability: GetUndertakerInformationAbility;

    beforeEach(() => {
        ability = new GetUndertakerInformationAbility();
    });

    /**
     * {@link `undertaker["gameplay"][3]`}
     */
    test('Nobody was executed today. That night, the Undertaker does not wake.', async () => {
        const undertakerPlayer = await createBasicPlayer(undefined, Undertaker);

        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(undertakerPlayer, []),
            [(context) => mockClocktowerForUndertaker(context, true, undefined)]
        );

        expect(await ability.isEligible(context)).toBeFalse();
    });
});
