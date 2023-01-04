import {
    chooseMock,
    GAME_UI,
    handleMock,
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
    SlayerAbility,
    SlayerAbilityUseResult,
    VirginAbility,
} from '~/game/ability';
import {
    mockAbilityUseContext,
    mockGetInfoAbilityUseContext,
    mockVirginAbilityUseContext,
} from '~/__mocks__/ability';
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
import { DeadPlayerCannotNominate } from '~/game/exception';
import { Execution } from '~/game/execution';
import { StoryTeller } from '~/game/storyteller';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Saint } from '~/content/characters/output/saint';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Monk } from '~/content/characters/output/monk';
import { Slayer } from '~/content/characters/output/slayer';

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

describe('test GetRavenkeeperInformationAbility', () => {
    /**
     * {@link `ravenkeeper["gameplay"][1]`}
     */
    test("The Imp attacks the Mayor. The Mayor doesn't die, but the Ravenkeeper dies instead, due to the Mayor's ability. The Ravenkeeper is woken and chooses Douglas, who is a dead Recluse. The Ravenkeeper learns that Douglas is the Scarlet Woman, since the Recluse registered as a Minion.", async () => {
        // TODO
    });
});

describe('test VirginAbility', () => {
    let ability: VirginAbility;
    let execution: Execution;
    let virginPlayer: Player;

    beforeEach(async () => {
        ability = new VirginAbility();
        execution = Execution.init();
        virginPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Virgin`
        );
    });

    /**
     * {@link `virgin["gameplay"][0]`}
     */
    test('The Washerwoman nominates the Virgin. The Washerwoman is immediately executed and the day ends.', async () => {
        const washerwomanPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Washerwoman`
        );

        const context = mockVirginAbilityUseContext(virginPlayer, execution);

        expect(await ability.isEligible(context)).toBeTrue();
        const result = await ability.use(context);

        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.CausedEffect
        );

        expect(washerwomanPlayer.alive).toBeTrue();
        const nomination = await washerwomanPlayer.nominate(
            virginPlayer,
            execution
        );
        expect(nomination).toBeDefined();
        expect(washerwomanPlayer.dead).toBeTrue();

        expect(await ability.isEligible(context)).toBeFalse();
    });

    /**
     * {@link `virgin["gameplay"][1]`}
     */
    test('The Drunk, who thinks they are the Chef, nominates the Virgin. The Drunk remains alive, and the Virgin loses their ability. Players may now vote on whether or not to execute the Virgin. (This happens because the Drunk is not a Townsfolk.)', async () => {
        const drunkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Drunk`
        );

        const context = mockVirginAbilityUseContext(virginPlayer, execution);

        expect(await ability.isEligible(context)).toBeTrue();
        const result = await ability.use(context);

        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.CausedEffect
        );

        expect(drunkPlayer.alive).toBeTrue();
        const nomination = await drunkPlayer.nominate(virginPlayer, execution);
        expect(nomination).toBeDefined();
        expect(drunkPlayer.alive).toBeTrue();

        expect(await ability.isEligible(context)).toBeFalse();
    });

    /**
     * {@link `virgin["gameplay"][2]`}
     */
    test('A dead player nominates the Virgin. The dead, however, cannot nominate. The Storyteller declares that the nomination does not count. The Virgin does not lose their ability.', async () => {
        const librarianPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Librarian`
        );

        const context = mockVirginAbilityUseContext(virginPlayer, execution);

        expect(await ability.isEligible(context)).toBeTrue();
        const result = await ability.use(context);

        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.CausedEffect
        );

        await librarianPlayer.setDead(DeadReason.DemonAttack);
        handleMock.mockImplementationOnce((error) => {
            expect(error).toBeInstanceOf(DeadPlayerCannotNominate);
            return Promise.resolve(true);
        });
        expect(librarianPlayer.dead).toBeTrue();
        const nomination = await librarianPlayer.nominate(
            virginPlayer,
            execution
        );
        expect(nomination).toBeUndefined();

        expect(await ability.isEligible(context)).toBeTrue();
    });
});

describe('test SlayerAbility', () => {
    let ability: SlayerAbility;
    let slayerPlayer: Player;

    beforeEach(async () => {
        ability = new SlayerAbility();
        slayerPlayer = await createBasicPlayer(undefined, Slayer);
    });

    /**
     * {@link `slayer["gameplay"][0]`}
     */
    test('The Slayer chooses the Imp. The Imp dies, and good wins!', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        const context = mockAbilityUseContext(slayerPlayer);
        expect(await ability.isEligible(context)).toBeTrue();

        chooseMock.mockImplementation((slayerPlayer, _players) => {
            expect(slayerPlayer.character).toEqual(Slayer);
            return Promise.resolve(impPlayer);
        });
        const result = (await ability.use(context)) as SlayerAbilityUseResult;
        chooseMock.mockReset();

        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.CausedEffect
        );
        expect(result.death?.deadReason).toBe(DeadReason.SlayerKill);
        expect(result.chosenPlayer).toBe(impPlayer);
        expect(await ability.isEligible(context)).toBeFalse();
    });

    /**
     * {@link `slayer["gameplay"][1]`}
     */
    test('The Slayer chooses the Recluse. The Storyteller decides that the Recluse registers as the Imp, so the Recluse dies, but the game continues.', async () => {
        // TODO
    });

    /**
     * {@link `slayer["gameplay"][2]`}
     */
    test('The Imp is bluffing as the Slayer. They declare that they use their Slayer ability on the Scarlet Woman. Nothing happens.', async () => {
        // TODO
    });
});
