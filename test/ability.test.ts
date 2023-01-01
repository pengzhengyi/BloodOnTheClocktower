import { GAME_UI, sendMock } from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import {
    AbilityUseStatus,
    GetWasherwomanInformationAbility,
} from '~/game/ability';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import { mockContextForWasherwomanInformation } from '~/__mocks__/information';

describe('test GetWasherwomanInformationAbility', () => {
    const ability = new GetWasherwomanInformationAbility();

    test('use when normal with mock storyteller', async () => {
        const context = mockGetInfoAbilityUseContext(() =>
            mockContextForWasherwomanInformation(true, true, true)
        );

        const result = await ability.use(context);
        expect(sendMock).toHaveBeenCalledOnce();
        expect(result.status).toEqual(
            AbilityUseStatus.Success |
                AbilityUseStatus.HasInfo |
                AbilityUseStatus.Communicated
        );
    });
});
