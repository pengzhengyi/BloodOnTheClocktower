import {
    chooseMock,
    GAME_UI,
    sendMock,
    storytellerChooseOneMock,
} from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { faker } from '@faker-js/faker';
import { createInfoProvideContext } from './infoprovider.test';
import { playerFromDescription } from './utils';
import {
    AbilityUseStatus,
    GetFortuneTellerInformationAbility,
    GetInformationAbilityUseResult,
    GetUndertakerInformationAbility,
    GetWasherwomanInformationAbility,
    RedHerringEffect,
} from '~/game/ability';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import {
    mockClocktowerForUndertaker,
    mockClocktowerWithIsFirstNight,
    mockContextForWasherwomanInformation,
} from '~/__mocks__/information';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { createBasicPlayer } from '~/__mocks__/player';
import type {
    FortuneTellerInformation,
    WasherwomanInformation,
} from '~/game/information';
import { Generator } from '~/game/collections';
import { Chef } from '~/content/characters/output/chef';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Townsfolk } from '~/game/charactertype';
import type { Player } from '~/game/player';
import { StoryTeller } from '~/game/storyteller';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Saint } from '~/content/characters/output/saint';
import { Undertaker } from '~/content/characters/output/undertaker';

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

        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(washerwomanPlayer, [Evin, Amy]),
            [(context) => mockClocktowerWithIsFirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const result = (await ability.use(
            context
        )) as GetInformationAbilityUseResult<WasherwomanInformation>;
        expect(result.info?.info.characterType).toBe(Townsfolk);
        expect(result.info?.info.players).toIncludeSameMembers([Evin, Amy]);
        expect(result.info?.info.character).toBeOneOf([Chef, Ravenkeeper]);
    });
});

describe('test GetFortuneTellerInformationAbility', () => {
    let ability: GetFortuneTellerInformationAbility;

    beforeEach(() => {
        ability = new GetFortuneTellerInformationAbility();
    });

    beforeAll(() => {
        storytellerChooseOneMock.mockImplementation(
            (options: Generator<any>, reason?: string) => {
                if (reason === RedHerringEffect.description) {
                    const players = options as Iterable<Player>;
                    const saintPlayer = Generator.take(
                        1,
                        Generator.filter(
                            (player) => player.character === Saint,
                            players
                        )
                    );
                    expect(saintPlayer).toBeDefined();
                    return Promise.resolve(saintPlayer);
                }

                return Promise.resolve(Generator.take(1, options));
            }
        );

        chooseMock.mockImplementation((fortuneTellerPlayer, players) => {
            expect(fortuneTellerPlayer.character).toEqual(FortuneTeller);
            return Promise.resolve(Generator.take(2, players));
        });
    });

    afterAll(() => {
        storytellerChooseOneMock.mockReset();
    });

    /**
     * {@link `fortuneteller["gameplay"][3]`}
     */
    test("The Fortune Teller chooses themselves and a Saint. The Saint is the Red Herring. The Fortune Teller learns a 'yes'.", async () => {
        const saintPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Saint`
        );
        const fortuneTellerPlayer = await createBasicPlayer(
            undefined,
            FortuneTeller
        );

        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(fortuneTellerPlayer, [saintPlayer]),
            [(context) => mockClocktowerWithIsFirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const result = (await ability.use(
            context
        )) as GetInformationAbilityUseResult<FortuneTellerInformation>;

        expect(result.info?.info.hasDemon).toBeTrue();
        expect(result.info?.info.chosenPlayers).toIncludeSameMembers([
            saintPlayer,
            fortuneTellerPlayer,
        ]);
    });
});

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

        expect(await ability.isEligible(context)).toBeTrue();
    });
});
