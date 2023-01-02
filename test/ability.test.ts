import {
    GAME_UI,
    sendMock,
    storytellerChooseOneMock,
} from '~/__mocks__/gameui';
import { Generator } from '~/game/collections';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { createInfoProvideContext } from './infoprovider.test';
import { playerFromDescription } from './utils';
import {
    AbilityUseStatus,
    GetInfoAbilityUseResult,
    GetWasherwomanInformationAbility,
} from '~/game/ability';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import { mockContextForWasherwomanInformation } from '~/__mocks__/information';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { createBasicPlayer } from '~/__mocks__/player';
import type { WasherwomanInformation } from '~/game/information';
import { Chef } from '~/content/characters/output/chef';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Townsfolk } from '~/game/charactertype';
import { StoryTeller } from '~/game/storyteller';

beforeAll(() => {
    storytellerChooseOneMock.mockImplementation((options: Generator<any>) =>
        Promise.resolve(options.take(1))
    );
});

afterAll(() => {
    storytellerChooseOneMock.mockReset();
});

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

    test('use when normal with storyteller', async () => {
        const Evin = await playerFromDescription('Evin is the Chef');
        const Amy = await playerFromDescription('Amy is the Ravenkeeper');
        const washerwomanPlayer = await createBasicPlayer(
            undefined,
            Washerwoman
        );

        const context = mockGetInfoAbilityUseContext(() =>
            createInfoProvideContext(washerwomanPlayer, [Evin, Amy])
        );
        context.storyteller = new StoryTeller();

        const result = (await ability.use(
            context
        )) as GetInfoAbilityUseResult<WasherwomanInformation>;
        expect(result.info?.info.characterType).toBe(Townsfolk);
        expect(result.info?.info.players).toIncludeSameMembers([Evin, Amy]);
        expect(result.info?.info.character).toBeOneOf([Chef, Ravenkeeper]);
    });
});
