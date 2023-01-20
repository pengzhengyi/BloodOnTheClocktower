import { createInfoProvideContext } from '../info-provider.test';
import { playerFromDescription } from '../utils';
import { expectCharacterGetInformation } from './common';
import { Chef } from '~/content/characters/output/chef';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Generator } from '~/game/collections';
import { AbilityUseStatus } from '~/game/ability/status';
import { GetWasherwomanInformationAbility } from '~/game/ability/washerwoman';
import { Townsfolk } from '~/game/character-type';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import {
    storytellerChooseOneMock,
    expectSendMockToHaveBeenCalled,
} from '~/__mocks__/game-ui';
import {
    mockContextForWasherwomanInformation,
    mockClocktowerWithIsFirstNight,
} from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';

describe('test GetWasherwomanInformationAbility', () => {
    let ability: GetWasherwomanInformationAbility;

    beforeEach(() => {
        ability = new GetWasherwomanInformationAbility();
    });

    beforeAll(() => {
        storytellerChooseOneMock.mockImplementation((options: Generator<any>) =>
            Promise.resolve(options.take(1))
        );
    });

    afterAll(() => {
        storytellerChooseOneMock.mockReset();
    });

    test('use when normal with mock storyteller', async () => {
        const context = mockGetInfoAbilityUseContext(() =>
            mockContextForWasherwomanInformation(true, true, true)
        );

        const result = await ability.use(context);
        expectSendMockToHaveBeenCalled();
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

        const info = await expectCharacterGetInformation(
            ability,
            () => createInfoProvideContext(washerwomanPlayer, [Evin, Amy]),
            [(context) => mockClocktowerWithIsFirstNight(context, true)]
        );

        expect(info.characterType).toBe(Townsfolk);
        expect(info.players).toIncludeSameMembers([Evin, Amy]);
        expect(info.character).toBeOneOf([Chef, Ravenkeeper]);
    });
});
