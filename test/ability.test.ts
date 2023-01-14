import { faker } from '@faker-js/faker';
import {
    createInfoProvideContext,
    createInfoProvideContextFromPlayerDescriptions,
    createUndertakerInfoProviderContext,
} from './infoprovider.test';
import { playerFromDescription } from './utils';
import {
    chooseMock,
    expectSendMockToHaveBeenCalled,
    handleMock,
    hasRaisedHandForVoteMock,
    storytellerChooseOneMock,
} from '~/__mocks__/gameui';
import {
    AbilitySetupContext,
    AbilitySuccessCommunicatedInfo,
    AbilityUseContext,
    AbilityUseStatus,
    ButlerAbility,
    GetCharacterInformationAbility,
    GetChefInformationAbility,
    GetEmpathInformationAbility,
    GetFortuneTellerInformationAbility,
    GetInfoAbilityUseContext,
    GetInformationAbilityUseResult,
    GetInvestigatorInformationAbility,
    GetRavenkeeperInformationAbility,
    GetUndertakerInformationAbility,
    GetWasherwomanInformationAbility,
    MayorAbility,
    MonkAbilityUseResult,
    MonkProtectAbility,
    RecluseAbility,
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
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/charactersheet';
import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import type { RavenkeeperInformation } from '~/game/information';
import { Generator } from '~/game/collections';
import { Chef } from '~/content/characters/output/chef';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Minion, Townsfolk } from '~/game/charactertype';
import type { Death } from '~/game/death';
import type { NightSheet } from '~/game/nightsheet';
import type { Player } from '~/game/player';
import { Alignment } from '~/game/alignment';
import type { GamePhase } from '~/game/gamephase';
import type { CharacterToken } from '~/game/character';
import type { CharacterSheet } from '~/game/charactersheet';
import type {
    Action,
    AsyncFactory,
    ReclusePlayer,
    SlayerPlayer,
    Task,
} from '~/game/types';
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
import { Mayor } from '~/content/characters/output/mayor';
import { Butler } from '~/content/characters/output/butler';
import { Virgin } from '~/content/characters/output/virgin';
import { Imp } from '~/content/characters/output/imp';
import { ScarletWoman } from '~/content/characters/output/scarletwoman';
import { Recluse } from '~/content/characters/output/recluse';
import { Empath } from '~/content/characters/output/empath';
import { InfoProvideContext } from '~/game/infoprovider';
import {
    IInformationRequester,
    InformationRequestContext,
} from '~/game/inforequester';
import { Investigator } from '~/content/characters/output/investigator';

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
    storytellerChooseOneMock.mockReset();
    expect(death).toBeDefined();
    expect(death.player.equals(playerDieInstead)).toBeTrue();
    expect(playerDieInstead.dead).toBeTrue();

    return death;
}

async function mockButlerChooseMaster(
    ability: ButlerAbility,
    master: Player,
    context?: AbilityUseContext,
    butlerPlayer?: Player
) {
    chooseMock.mockResolvedValue(master);
    await ability.use(context ?? mockAbilityUseContext(butlerPlayer));
    chooseMock.mockReset();
}

async function mockRecluseRegisterAs<T>(
    reclusePlayer: ReclusePlayer,
    action: AsyncFactory<T>,
    registerAsCharacter: CharacterToken,
    registerAsAlignment?: Alignment,
    recluseAbility?: RecluseAbility,
    setupContext?: AbilitySetupContext,
    characterSheet?: CharacterSheet,
    requireAbilitySetup = true
): Promise<T> {
    if (requireAbilitySetup) {
        recluseAbility ??= new RecluseAbility();
        characterSheet ??= getTroubleBrewingCharacterSheet();
        setupContext ??= mockAbilitySetupContext(
            reclusePlayer,
            undefined,
            undefined,
            undefined,
            characterSheet
        );

        await recluseAbility.setup(setupContext);
    }

    registerAsAlignment ??= registerAsCharacter.characterType.defaultAlignment;

    storytellerChooseOneMock.mockImplementation(
        (options: Generator<any>, reason?: string) => {
            if (reason?.includes('character')) {
                return Promise.resolve(registerAsCharacter);
            } else if (reason?.includes('alignment')) {
                return Promise.resolve(registerAsAlignment);
            } else {
                return Promise.resolve(options.take(1));
            }
        }
    );
    const result = await action();
    storytellerChooseOneMock.mockReset();

    return result;
}

async function expectCharacterGetInformation<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>,
    TInformationRequester extends IInformationRequester<
        TInformation,
        TInformationRequestContext
    >
>(
    ability?: GetCharacterInformationAbility<
        TInformation,
        TInformationRequester
    >,
    mockInfoProvideContext?: () => InfoProvideContext,
    contextModifications?: Array<Task<GetInfoAbilityUseContext>>,
    abilityInitializer?: (
        context: GetInfoAbilityUseContext
    ) => Promise<
        GetCharacterInformationAbility<TInformation, TInformationRequester>
    >
): Promise<TInformation> {
    const context = mockGetInfoAbilityUseContext(
        mockInfoProvideContext,
        contextModifications
    );

    context.storyteller = new StoryTeller();

    if (ability === undefined) {
        ability = await abilityInitializer!(context);
    }

    const result = (await ability.use(
        context
    )) as GetInformationAbilityUseResult<TInformation>;

    expect(result.info).toBeDefined();
    expect(result.status).toEqual(AbilitySuccessCommunicatedInfo);

    return result.info?.info as TInformation;
}

async function expectAfterSlayerKill(
    ability: SlayerAbility,
    chosenPlayer: Player,
    shouldBeDead: boolean,
    context?: AbilityUseContext,
    slayerPlayer?: SlayerPlayer
) {
    context ??= mockAbilityUseContext(slayerPlayer);
    expect(await ability.isEligible(context)).toBeTrue();

    chooseMock.mockImplementation(async (_slayerPlayer, _players) => {
        expect(await _slayerPlayer.character).toEqual(Slayer);
        return chosenPlayer;
    });
    const result = (await ability.use(context)) as SlayerAbilityUseResult;
    chooseMock.mockReset();

    if (shouldBeDead) {
        expect(result.death?.deadReason).toBe(DeadReason.SlayerKill);
        expect(result.status).toEqual(
            AbilityUseStatus.Success | AbilityUseStatus.HasEffect
        );
        expect(chosenPlayer.dead).toBeTrue();
    } else {
        expect(result.death).toBeUndefined();
        expect(chosenPlayer.dead).toBeFalse();
    }

    expect(result.chosenPlayer).toBe(chosenPlayer);
    expect(await ability.isEligible(context)).toBeFalse();
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

describe('test GetFortuneTellerInformationAbility', () => {
    beforeAll(() => {
        storytellerChooseOneMock.mockImplementation(
            async (options: Generator<any>, reason?: string) => {
                if (reason === RedHerringEffect.description) {
                    const players = options as Iterable<Player>;
                    const saintPlayerCandidates = await Generator.filterAsync(
                        async (player) => (await player.character) === Saint,
                        players
                    );
                    const saintPlayer = Generator.take(
                        1,
                        saintPlayerCandidates
                    );
                    expect(saintPlayer).toBeDefined();
                    return saintPlayer;
                }

                return Promise.resolve(Generator.take(1, options));
            }
        );

        chooseMock.mockImplementation(async (fortuneTellerPlayer, players) => {
            expect(await fortuneTellerPlayer.character).toEqual(FortuneTeller);
            return Generator.take(2, players);
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

        const info = await expectCharacterGetInformation(
            undefined,
            () => createInfoProvideContext(fortuneTellerPlayer, [saintPlayer]),
            [(context) => mockClocktowerWithIsFirstNight(context, true)],
            async (context) =>
                await GetFortuneTellerInformationAbility.init(
                    mockAbilitySetupContext(undefined, undefined, context)
                )
        );

        expect(info.hasDemon).toBeTrue();
        expect(info.chosenPlayers).toIncludeSameMembers([
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
    chooseMock.mockImplementation(async (_monkPlayer, _players) => {
        expect(await _monkPlayer.character).toEqual(Monk);
        return playerToProtect;
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
    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(5);
    });

    afterAll(() => recoverGamePhase());

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
        const result = (await mockRecluseRegisterAs(
            Douglas,
            () => ravenKeeperAbility.use(context),
            ScarletWoman
        )) as GetInformationAbilityUseResult<RavenkeeperInformation>;

        chooseMock.mockReset();

        expect(result.status).toEqual(AbilitySuccessCommunicatedInfo);
        expectSendMockToHaveBeenCalled();
        expect(result.isTrueInformation).toBeTrue();
        expect(result.info?.info?.chosenPlayer).toBe(Douglas);
        expect(result.info?.info?.character).toBe(ScarletWoman);
    });
});

describe('test VirginAbility', () => {
    let ability: VirginAbility;
    let execution: Execution;
    let virginPlayer: Player;

    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(3);
    });

    afterAll(() => recoverGamePhase());

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

        await expectAfterSlayerKill(
            ability,
            impPlayer,
            true,
            undefined,
            slayerPlayer
        );
    });

    /**
     * {@link `slayer["gameplay"][1]`}
     */
    test('The Slayer chooses the Recluse. The Storyteller decides that the Recluse registers as the Imp, so the Recluse dies, but the game continues.', async () => {
        const reclusePlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Recluse`
        );

        await mockRecluseRegisterAs(
            reclusePlayer,
            () =>
                expectAfterSlayerKill(
                    ability,
                    reclusePlayer,
                    true,
                    undefined,
                    slayerPlayer
                ),
            Imp
        );
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

describe('test MayorAbility', () => {
    let mayorPlayer: Player;

    beforeEach(async () => {
        mayorPlayer = await createBasicPlayer(undefined, Mayor);
    });

    /**
     * {@link `mayor["gameplay"][0]`}
     */
    test('The Imp attacks the Mayor. The Storyteller chooses that the Ravenkeeper dies instead.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const ravenkeeperPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Ravenkeeper`
        );

        const context = mockMayorAbilitySetupContext(
            mayorPlayer,
            undefined,
            undefined,
            troubleBrewingNightSheet
        );
        const mayorAbility = await MayorAbility.init(context);

        expect(await mayorAbility.isEligible(context)).toBeTrue();

        await expectDieInsteadAfterDemonAttack(
            mayorPlayer,
            impPlayer,
            ravenkeeperPlayer
        );
    });

    /**
     * {@link `mayor["gameplay"][1]`}
     */
    test('There are three players alive. There are no nominations for execution today. Good wins.', async () => {
        // const game = createBasicGame();
        // const context = mockMayorAbilitySetupContext(
        //     mayorPlayer,
        //     undefined,
        //     game,
        //     troubleBrewingNightSheet
        // );
        // await MayorAbility.init(context);
        // const winningTeam = game.getWinningTeam([mayorPlayer])
        // expect(winningTeam).toBe(Alignment.Good);
        // TODO
    });

    /**
     * {@link `mayor["gameplay"][2]`}
     */
    test('There are five players alive, including two Travellers. Both Travellers are exiled, and the vote is tied between the remaining players. Because a tied vote means neither player is executed, good wins.', async () => {
        // TODO
    });
});

describe('test ButlerAbility', () => {
    let butlerPlayer: Player;
    let butlerAbility: ButlerAbility;
    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(3);
    });

    afterAll(() => recoverGamePhase());

    beforeEach(async () => {
        butlerPlayer = await createBasicPlayer(undefined, Butler);
        butlerAbility = new ButlerAbility();
    });

    /**
     * {@link `butler["gameplay"][0]`}
     */
    test('The Butler chooses Filip to be their Master. Tomorrow, if Filip raises his hand to vote on an execution, then the Butler may too. If not, then the Butler may not raise their hand.', async () => {
        const Filip = await createBasicPlayer('Filip', Virgin);

        const context = mockAbilityUseContext(butlerPlayer);

        expect(await butlerAbility.isEligible(context)).toBeTrue();

        await mockButlerChooseMaster(butlerAbility, Filip, context);

        hasRaisedHandForVoteMock.mockResolvedValue(true);
        expect(await butlerPlayer.canVote).toBeTrue();
        hasRaisedHandForVoteMock.mockReset();

        hasRaisedHandForVoteMock.mockResolvedValue(false);
        expect(await butlerPlayer.canVote).toBeFalse();
        hasRaisedHandForVoteMock.mockReset();
    });

    /**
     * {@link `butler["gameplay"][1]`}
     */
    test('A nomination is in progress. The Butler and their Master both have their hands raised to vote. As the Storyteller is counting votes, the Master lowers their hand at the last second. The Butler must lower their hand immediately.', async () => {
        // TODO
    });

    /**
     * {@link `butler["gameplay"][2]`}
     */
    test('The Butler is dead. Because dead players have no ability, the Butler may vote with their vote token at any time.', async () => {
        const Filip = await createBasicPlayer('Filip', Virgin);

        await mockButlerChooseMaster(
            butlerAbility,
            Filip,
            undefined,
            butlerPlayer
        );

        await butlerPlayer.setDead(DeadReason.Other);
        expect(await butlerPlayer.canVote).toBeTrue();
    });
});

describe('test RecluseAbility', () => {
    /**
     * {@link `recluse["gameplay"][0]`}
     */
    test('The Slayer uses their ability on the Recluse . The Storyteller decides that the Recluse registers as the Imp, so the Recluse dies. The Slayer believes that they just killed the Imp.', async () => {
        const reclusePlayer = await createBasicPlayer(undefined, Recluse);
        const slayerPlayer = await createBasicPlayer(undefined, Slayer);

        await mockRecluseRegisterAs(
            reclusePlayer,
            () =>
                expectAfterSlayerKill(
                    new SlayerAbility(),
                    reclusePlayer,
                    true,
                    undefined,
                    slayerPlayer
                ),
            Imp
        );
    });

    /**
     * {@link `recluse["gameplay"][1]`}
     */
    test('The Empath, who neighbours the Recluse and the Monk, learns she is neighbouring one evil player. The next night, the Empath learns they are neighbouring no evil players.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Empath,
                `${faker.name.firstName()} is the Recluse`,
                `${faker.name.firstName()} is the Empath`,
                `${faker.name.firstName()} is the Monk`
            );

        const reclusePlayer = (await infoProvideContext.players.findAsync(
            async (player) => (await player.character) === Recluse
        ))!;

        const ability = new GetEmpathInformationAbility();

        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [(context) => mockClocktowerWithIsFirstNight(context, true)]
                ),
            Imp
        );

        expect(info.numEvilAliveNeighbors).toEqual(1);

        const infoNextNight = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [
                        (context) =>
                            mockClocktowerWithIsNonfirstNight(context, true),
                    ]
                ),
            Recluse,
            undefined,
            undefined,
            undefined,
            undefined,
            false
        );

        expect(infoNextNight.numEvilAliveNeighbors).toEqual(0);
    });

    /**
     * {@link `recluse["gameplay"][2]`}
     */
    test('The Investigator learns that either the Recluse or the Saint is the Scarlet Woman.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Investigator,
                `${faker.name.firstName()} is the Recluse`,
                `${faker.name.firstName()} is the Investigator`,
                `${faker.name.firstName()} is the Saint`
            );

        const reclusePlayer = (await infoProvideContext.players.findAsync(
            async (player) => (await player.character) === Recluse
        ))!;

        const ability = new GetInvestigatorInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [
                        (context) =>
                            mockClocktowerWithIsNonfirstNight(context, true),
                    ]
                ),
            ScarletWoman
        );

        expect(info.characterType.is(Minion)).toBeTrue();
        expect(info.character).toBe(ScarletWoman);
    });

    /**
     * {@link `recluse["gameplay"][3]`}
     */
    test('The Recluse is executed. The Undertaker learns that the Imp was executed.', async () => {
        const reclusePlayer = await createBasicPlayer(undefined, Recluse);
        const undertakerPlayer = await createBasicPlayer(undefined, Undertaker);

        const ability = new GetUndertakerInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () =>
                        createUndertakerInfoProviderContext(
                            undertakerPlayer,
                            reclusePlayer,
                            []
                        ),
                    [
                        (context) =>
                            mockClocktowerForUndertaker(
                                context,
                                true,
                                reclusePlayer
                            ),
                    ]
                ),
            Imp
        );

        expect(info.character).toBe(Imp);
        expect(info.executedPlayer).toBe(reclusePlayer);
    });

    /**
     * {@link `recluse["gameplay"][4]`}
     */
    test('The Recluse neighbours the Imp and an Evil Traveller. Because showing a "2" to the Chef might be too revealing, the Chef learns true information, a "0,” instead.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Chef,
                `${faker.name.firstName()} is the evil Scapegoat`,
                `${faker.name.firstName()} is the Recluse`,
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Chef`
            );

        const reclusePlayer = (await infoProvideContext.players.findAsync(
            async (player) => (await player.character) === Recluse
        ))!;

        const ability = new GetChefInformationAbility();
        const info = await mockRecluseRegisterAs(
            reclusePlayer,
            async () =>
                await expectCharacterGetInformation(
                    ability,
                    () => infoProvideContext,
                    [(context) => mockClocktowerWithIsFirstNight(context, true)]
                ),
            Recluse
        );

        expect(info.numPairEvilPlayers).toEqual(0);
    });
});
