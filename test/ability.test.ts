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
    MonkAbilityUseResult,
    MonkProtectAbility,
    RedHerringEffect,
} from '~/game/ability';
import { mockGetInfoAbilityUseContext } from '~/__mocks__/ability';
import {
    mockClocktowerForUndertaker,
    mockClocktowerWithIsFirstNight,
    mockClocktowerWithIsNonfirstNight,
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
import { DeadReason } from '~/game/deadreason';
import { StoryTeller } from '~/game/storyteller';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Saint } from '~/content/characters/output/saint';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Monk } from '~/content/characters/output/monk';

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
        chooseMock.mockReset();
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

        expect(await ability.isEligible(context)).toBeFalse();
    });
});

describe('test MonkProtectAbility', () => {
    let ability: MonkProtectAbility;

    beforeEach(() => {
        ability = new MonkProtectAbility();
    });

    /**
     * {@link `monk["gameplay"][0]`}
     */
    test('The Monk protects the Fortune Teller. The Imp attacks the Fortune Teller. No deaths occur tonight.', async () => {
        const fortuneTellerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Fortune Teller`
        );
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const monkPlayer = await createBasicPlayer(undefined, Monk);

        const context = mockGetInfoAbilityUseContext(
            () =>
                createInfoProvideContext(monkPlayer, [
                    impPlayer,
                    fortuneTellerPlayer,
                ]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        chooseMock.mockImplementation((_monkPlayer, _players) => {
            expect(_monkPlayer.character).toEqual(Monk);
            return Promise.resolve(fortuneTellerPlayer);
        });
        const result = await ability.use(context);
        chooseMock.mockReset();

        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.CausedEffect
        );
        expect((result as MonkAbilityUseResult).protectedPlayer).toEqual(
            fortuneTellerPlayer
        );

        expect(fortuneTellerPlayer.alive).toBeTrue();
        await fortuneTellerPlayer
            .from(impPlayer)
            .setDead(DeadReason.DemonAttack);
        expect(fortuneTellerPlayer.alive).toBeTrue();
    });

    /**
     * {@link `monk["gameplay"][1]`}
     */
    test(`The Monk protects the Mayor, and the Imp attacks the Mayor. The Mayor's "another player dies" ability does not trigger, because the Mayor is safe from the Imp. Nobody dies tonight.`, async () => {
        // TODO
    });

    /**
     * {@link `monk["gameplay"][2]`}
     */
    test('The Monk protects the Imp . The Imp chooses to kill themself tonight, but nothing happens. The Imp stays alive and a new Imp is not created.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const monkPlayer = await createBasicPlayer(undefined, Monk);

        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(monkPlayer, [impPlayer]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        chooseMock.mockImplementation((_monkPlayer, _players) => {
            expect(_monkPlayer.character).toEqual(Monk);
            return Promise.resolve(impPlayer);
        });
        const result = await ability.use(context);
        chooseMock.mockReset();

        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.CausedEffect
        );
        expect((result as MonkAbilityUseResult).protectedPlayer).toEqual(
            impPlayer
        );

        expect(impPlayer.alive).toBeTrue();
        await impPlayer.from(impPlayer).setDead(DeadReason.DemonAttack);
        expect(impPlayer.alive).toBeTrue();
    });
});
