import { faker } from '@faker-js/faker';
import { createInfoProvideContext } from './infoprovider.test';
import { playerFromDescription } from './utils';
import {
    chooseMock,
    expectSendMockToHaveBeenCalled,
    handleMock,
    storytellerChooseOneMock,
} from '~/__mocks__/gameui';
import {
    AbilitySuccessCommunicatedInfo,
    AbilityUseStatus,
    GetFortuneTellerInformationAbility,
    GetInfoAbilityUseContext,
    GetInformationAbilityUseResult,
    GetRavenkeeperInformationAbility,
    GetUndertakerInformationAbility,
    GetWasherwomanInformationAbility,
    MayorAbility,
    MonkAbilityUseResult,
    MonkProtectAbility,
    RedHerringEffect,
    SlayerAbility,
    SlayerAbilityUseResult,
    SoldierAbility,
    VirginAbility,
} from '~/game/ability';
import {
    mockAbilitySetupContext,
    mockAbilityUseContext,
    mockGetInfoAbilityUseContext,
    mockMayorAbilitySetupContext,
    mockVirginAbilityUseContext,
} from '~/__mocks__/ability';
import {
    mockClocktowerForDeathAtNight,
    mockClocktowerForUndertaker,
    mockClocktowerWithIsFirstNight,
    mockClocktowerWithIsNonfirstNight,
    mockContextForWasherwomanInformation,
} from '~/__mocks__/information';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { createBasicPlayer } from '~/__mocks__/player';
import { getTroubleBrewingNightSheet } from '~/__mocks__/nightsheet';
import type {
    FortuneTellerInformation,
    RavenkeeperInformation,
    WasherwomanInformation,
} from '~/game/information';
import { Generator } from '~/game/collections';
import { Chef } from '~/content/characters/output/chef';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Townsfolk } from '~/game/charactertype';
import type { Death } from '~/game/death';
import type { NightSheet } from '~/game/nightsheet';
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
import { Soldier } from '~/content/characters/output/soldier';

async function expectAfterDemonAttack(
    playerToKill: Player,
    demonPlayer: Player,
    expectToBeDead = true
): Promise<Death> {
    expect(playerToKill.alive).toBeTrue();
    const death = await playerToKill
        .from(demonPlayer)
        .setDead(DeadReason.DemonAttack);

    if (expectToBeDead) {
        expect(playerToKill.dead).toBeTrue();
        expect(death).toBeDefined();
    } else {
        expect(playerToKill.alive).toBeTrue();
        expect(death).toBeUndefined();
    }

    return death;
}

async function expectDieInsteadAfterDemonAttack(
    mayorPlayer: Player,
    demonPlayer: Player,
    playerDieInstead: Player
): Promise<Death> {
    expect(mayorPlayer.alive).toBeTrue();
    storytellerChooseOneMock.mockResolvedValue(playerDieInstead);
    const death = await mayorPlayer
        .from(demonPlayer)
        .setDead(DeadReason.DemonAttack);
    expect(mayorPlayer.alive).toBeTrue();
    expect(storytellerChooseOneMock).toHaveBeenCalledOnce();
    storytellerChooseOneMock.mockReset();
    expect(death).toBeDefined();
    expect(death.player.equals(playerDieInstead)).toBeTrue();
    expect(playerDieInstead.dead).toBeTrue();

    return death;
}

let troubleBrewingNightSheet: NightSheet;

beforeAll(async () => {
    troubleBrewingNightSheet = await getTroubleBrewingNightSheet();
});

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
        const ability = await GetFortuneTellerInformationAbility.init(
            mockAbilitySetupContext(undefined, undefined, context)
        );

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

async function monkProtectPlayer(
    ability: MonkProtectAbility,
    context: GetInfoAbilityUseContext,
    playerToProtect: Player
): Promise<MonkAbilityUseResult> {
    chooseMock.mockImplementation((_monkPlayer, _players) => {
        expect(_monkPlayer.character).toEqual(Monk);
        return Promise.resolve(playerToProtect);
    });
    const result = (await ability.use(context)) as MonkAbilityUseResult;
    chooseMock.mockReset();

    expect(result.status).toEqual(
        AbilityUseStatus.Success | AbilityUseStatus.HasEffect
    );
    expect(result.protectedPlayer).toEqual(playerToProtect);
    return result;
}

describe('test MonkProtectAbility', () => {
    let ability: MonkProtectAbility;
    let impPlayer: Player;
    let monkPlayer: Player;

    beforeEach(async () => {
        ability = new MonkProtectAbility();
        impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        monkPlayer = await createBasicPlayer(undefined, Monk);
    });

    /**
     * {@link `monk["gameplay"][0]`}
     */
    test('The Monk protects the Fortune Teller. The Imp attacks the Fortune Teller. No deaths occur tonight.', async () => {
        const fortuneTellerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Fortune Teller`
        );

        const context = mockGetInfoAbilityUseContext(
            () =>
                createInfoProvideContext(monkPlayer, [
                    impPlayer,
                    fortuneTellerPlayer,
                ]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const _result = await monkProtectPlayer(
            ability,
            context,
            fortuneTellerPlayer
        );

        await expectAfterDemonAttack(fortuneTellerPlayer, impPlayer, false);
    });

    /**
     * {@link `monk["gameplay"][1]`}
     */
    test(`The Monk protects the Mayor, and the Imp attacks the Mayor. The Mayor's "another player dies" ability does not trigger, because the Mayor is safe from the Imp. Nobody dies tonight.`, async () => {
        const mayorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Mayor`
        );
        const context = mockGetInfoAbilityUseContext(
            () =>
                createInfoProvideContext(monkPlayer, [impPlayer, mayorPlayer]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const mayorAbility = await MayorAbility.init(
            mockMayorAbilitySetupContext(
                mayorPlayer,
                context.players,
                undefined,
                troubleBrewingNightSheet
            )
        );
        expect(await mayorAbility.isEligible(context)).toBeTrue();

        const _result = await monkProtectPlayer(ability, context, mayorPlayer);

        await expectAfterDemonAttack(mayorPlayer, impPlayer, false);
        expect(monkPlayer.alive).toBeTrue();
        expect(impPlayer.alive).toBeTrue();
    });

    /**
     * {@link `monk["gameplay"][2]`}
     */
    test('The Monk protects the Imp . The Imp chooses to kill themself tonight, but nothing happens. The Imp stays alive and a new Imp is not created.', async () => {
        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(monkPlayer, [impPlayer]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const _result = await monkProtectPlayer(ability, context, impPlayer);

        await expectAfterDemonAttack(impPlayer, impPlayer, false);
    });
});

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
            troubleBrewingNightSheet
        );
        const mayorAbility = await MayorAbility.init(setupContext);
        expect(await mayorAbility.isEligible(context)).toBeTrue();

        context.storyteller = new StoryTeller();
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
        const result = (await ravenKeeperAbility.use(
            context
        )) as GetInformationAbilityUseResult<RavenkeeperInformation>;
        chooseMock.mockReset();

        expect(result.status).toEqual(AbilitySuccessCommunicatedInfo);
        expectSendMockToHaveBeenCalled();
        expect(result.isTrueInformation).toBeTrue();

        // TODO recluse ability registration and activation
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
            AbilityUseStatus.Success | AbilityUseStatus.HasEffect
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
            AbilityUseStatus.Success | AbilityUseStatus.HasEffect
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
            AbilityUseStatus.Success | AbilityUseStatus.HasEffect
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
            AbilityUseStatus.Success | AbilityUseStatus.HasEffect
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

describe('test SoldierAbility', () => {
    let _ability: SoldierAbility;
    let soldierPlayer: Player;
    let impPlayer: Player;

    beforeEach(async () => {
        soldierPlayer = await createBasicPlayer(undefined, Soldier);
        _ability = await SoldierAbility.init(
            mockAbilitySetupContext(soldierPlayer)
        );
        impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
    });

    /**
     * {@link `soldier["gameplay"][0]`}
     */
    test('The Imp attacks the Soldier. The Soldier does not die, so nobody dies that night.', async () => {
        await expectAfterDemonAttack(soldierPlayer, impPlayer, false);
    });

    /**
     * {@link `soldier["gameplay"][1]`}
     */
    test('The Poisoner poisons the Soldier, then the Imp attacks the Soldier. The Soldier dies, since they have no ability.', async () => {
        // TODO
    });

    /**
     * {@link `soldier["gameplay"][2]`}
     */
    test('The Imp attacks the Soldier. The Soldier dies, because they are actually the Drunk.', async () => {
        // TODO
    });
});
