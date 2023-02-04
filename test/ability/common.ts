import { createInfoProvideContext } from '../info-provider.test';
import { Monk } from '~/content/characters/output/monk';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    GetCharacterInformationAbility,
    GetInfoAbilityUseContext,
    GetInformationAbilityUseResult,
} from '~/game/ability/ability';
import {
    MonkProtectAbility,
    type MonkAbilityUseResult,
} from '~/game/ability/monk';
import { RecluseAbility } from '~/game/ability/recluse';
import {
    AbilitySuccessCommunicatedFalseInfo,
    AbilitySuccessCommunicatedInfo,
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
    AbilityUseStatus,
} from '~/game/ability/status';
import { type Generator } from '~/game/collections';
import { Alignment } from '~/game/alignment';
import type { CharacterToken } from '~/game/character';
import type { CharacterSheet } from '~/game/character-sheet';
import { DeadReason } from '~/game/dead-reason';
import type { Death } from '~/game/death';
import type { InfoProvideContext } from '~/game/info/provider/provider';
import type {
    InformationRequestContext,
    IInformationRequester,
} from '~/game/info/requester/requester';
import type { IPlayer } from '~/game/player';
import { StoryTeller } from '~/game/storyteller';
import type {
    AsyncFactory,
    DemonPlayer,
    DrunkPlayer,
    ImpPlayer,
    MinionPlayer,
    MonkPlayer,
    PoisonerPlayer,
    ReclusePlayer,
    SaintPlayer,
    ScarletWomanPlayer,
    SlayerPlayer,
    SpyPlayer,
    Task,
    UndertakerPlayer,
    VirginPlayer,
} from '~/game/types';
import {
    mockAbilitySetupContext,
    mockAbilityUseContext,
    mockGetInfoAbilityUseContext,
    mockPoisonerAbilitySetupContext,
    mockSaintAbilitySetupContext,
    mockSaintAbilityUseContext,
    mockVirginAbilityUseContext,
} from '~/__mocks__/ability';
import {
    getTroubleBrewingCharacterSheet,
    mockCharacterSheet,
} from '~/__mocks__/character-sheet';
import {
    chooseMock,
    mockStorytellerChooseMatchingOne,
    storytellerChooseOneMock,
    storytellerConfirmMock,
} from '~/__mocks__/game-ui';
import { Slayer } from '~/content/characters/output/slayer';
import type {
    SlayerAbility,
    SlayerAbilityUseResult,
} from '~/game/ability/slayer';
import { Execution } from '~/game/execution';
import type { ButlerAbility } from '~/game/ability/butler';
import { DrunkAbility } from '~/game/ability/drunk';
import { AbilityLoader } from '~/game/ability/loader';
import {
    PoisonerAbility,
    type PoisonerAbilityUseResult,
} from '~/game/ability/poisoner';
import { Poisoner } from '~/content/characters/output/poisoner';
import type { NightSheet } from '~/game/night-sheet';
import { type GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import { mockClocktowerForUndertaker } from '~/__mocks__/information';
import {
    SaintAbility,
    type SaintAbilitySetupContext,
    type SaintAbilityUseContext,
} from '~/game/ability/saint';
import { type IPlayers, Players } from '~/game/players';
import { SpyAbility } from '~/game/ability/spy';
import {
    VirginAbility,
    type VirginAbilityUseContext,
} from '~/game/ability/virgin';
import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import type { IClocktower } from '~/game/clocktower';
import { Demon } from '~/game/character-type';
import { ScarletWomanAbility } from '~/game/ability/scarlet-woman';
import { createBasicGame } from '~/__mocks__/game';
import { ImpAbility, type ImpAbilityUseResult } from '~/game/ability/imp';
import { Imp } from '~/content/characters/output/imp';

export async function expectCharacterGetInformation<
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

    const willMalfunction = await ability.willMalfunction(context);
    expect(result.info).toBeDefined();

    if (willMalfunction) {
        expect(result.status).toEqual(AbilitySuccessCommunicatedFalseInfo);
    } else {
        expect(result.status).toEqual(AbilitySuccessCommunicatedInfo);
    }

    return result.info?.info as TInformation;
}

export async function monkProtectPlayer(
    ability: MonkProtectAbility,
    context: GetInfoAbilityUseContext,
    playerToProtect: IPlayer
): Promise<MonkAbilityUseResult> {
    chooseMock.mockImplementation(async (_monkPlayer, _players) => {
        expect(await _monkPlayer.character).toEqual(Monk);
        return playerToProtect;
    });
    const result = (await ability.use(context)) as MonkAbilityUseResult;
    chooseMock.mockReset();

    expect(result.status).toEqual(AbilitySuccessUseWhenHasEffect);
    expect(result.protectedPlayer).toEqual(playerToProtect);
    return result;
}

export async function expectAfterDemonAttack(
    playerToKill: IPlayer,
    demonPlayer: DemonPlayer,
    expectToBeDead = true
): Promise<Death> {
    expect(await playerToKill.alive).toBeTrue();
    const death = await playerToKill
        .from(demonPlayer)
        .setDead(DeadReason.DemonAttack);

    if (expectToBeDead) {
        expect(await playerToKill.dead).toBeTrue();
        expect(death).toBeDefined();
    } else {
        expect(await playerToKill.alive).toBeTrue();
        expect(death).toBeUndefined();
    }

    return death;
}

export async function expectAfterImpKill(
    playerToKill: IPlayer,
    impPlayer: ImpPlayer,
    impAbility?: ImpAbility,
    setupContext?: AbilitySetupContext,
    useContext?: AbilityUseContext,
    players?: IPlayers,
    expectToBeDead = true
): Promise<Death | undefined> {
    expect(await playerToKill.alive).toBeTrue();

    if (impAbility === undefined) {
        impAbility = new ImpAbility();
        setupContext ??= mockAbilitySetupContext(impPlayer, players);
        await impAbility.setup(setupContext);
    }

    useContext ??= mockAbilityUseContext(impPlayer, players);
    chooseMock.mockResolvedValue(playerToKill);
    const result = (await impAbility.use(useContext)) as ImpAbilityUseResult;
    chooseMock.mockReset();

    expect(result.playerToKill?.equals(playerToKill)).toBeTrue();
    if (expectToBeDead) {
        expect(await playerToKill.dead).toBeTrue();
        expect(result.death).toBeDefined();
    } else {
        expect(await playerToKill.alive).toBeTrue();
        expect(result.death).toBeUndefined();
    }

    return result.death;
}

export async function expectAfterImpSelfKill(
    impPlayer: ImpPlayer,
    minionPlayerToBecomeDemon: MinionPlayer,
    impAbility?: ImpAbility,
    setupContext?: AbilitySetupContext,
    useContext?: AbilityUseContext,
    players?: IPlayers
): Promise<Death | undefined> {
    mockStorytellerChooseMatchingOne<MinionPlayer>((player) =>
        player.equals(minionPlayerToBecomeDemon)
    );
    storytellerConfirmMock.mockResolvedValue(true);
    const death = await expectAfterImpKill(
        impPlayer,
        impPlayer,
        impAbility,
        setupContext,
        useContext,
        players,
        true
    );
    storytellerConfirmMock.mockReset();
    storytellerChooseOneMock.mockReset();
    expect(death?.isFor(impPlayer)).toBeTrue();
    expect(await minionPlayerToBecomeDemon.characterType).toBe(Demon);
    expect(await minionPlayerToBecomeDemon.character).toBe(Imp);

    return death;
}

export async function mockRecluseRegisterAs<T>(
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

        await recluseAbility.setup(
            setupContext ??
                mockAbilitySetupContext(
                    reclusePlayer,
                    undefined,
                    undefined,
                    undefined,
                    characterSheet
                )
        );
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

export async function mockSpyRegisterAs<T>(
    spyPlayer: SpyPlayer,
    action: AsyncFactory<T>,
    registerAsCharacter: CharacterToken,
    registerAsAlignment?: Alignment,
    spyAbility?: SpyAbility,
    setupContext?: AbilitySetupContext,
    characterSheet?: CharacterSheet,
    requireAbilitySetup = true
): Promise<T> {
    if (requireAbilitySetup) {
        spyAbility ??= new SpyAbility();
        characterSheet ??= getTroubleBrewingCharacterSheet();

        await spyAbility.setup(
            setupContext ??
                mockAbilitySetupContext(
                    spyPlayer,
                    undefined,
                    undefined,
                    undefined,
                    characterSheet
                )
        );
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

export async function expectAfterNominateVirgin(
    nominator: IPlayer,
    virginPlayer: VirginPlayer,
    execution?: Execution,
    ability?: VirginAbility,
    context?: VirginAbilityUseContext,
    expectDead = true,
    expectHasAbility = false
) {
    execution ??= Execution.init();
    ability ??= new VirginAbility();
    context ??= mockVirginAbilityUseContext(virginPlayer, execution);

    expect(await ability.isEligible(context)).toBeTrue();
    const result = await ability.use(context);

    expect(result.status).toEqual(
        AbilityUseStatus.Success | AbilityUseStatus.HasEffect
    );

    if (expectDead) {
        storytellerConfirmMock.mockResolvedValue(true);
    }

    const [_gamePhase, recover] = mockGamePhaseTemporarily(3);
    const nomination = await nominator.nominate(virginPlayer, execution);

    recover();

    if (expectHasAbility) {
        expect(nomination).toBeUndefined();
    } else {
        expect(nomination).toBeDefined();
    }

    if (expectDead) {
        expect(await nominator.dead).toBeTrue();
        storytellerConfirmMock.mockReset();
    } else {
        expect(await nominator.dead).toBeFalse();
    }

    if (expectHasAbility) {
        expect(await ability.isEligible(context)).toBeTrue();
    } else {
        expect(await ability.isEligible(context)).toBeFalse();
    }
}

export async function expectDieInsteadAfterDemonAttack(
    mayorPlayer: IPlayer,
    demonPlayer: IPlayer,
    playerDieInstead: IPlayer
): Promise<Death> {
    expect(await mayorPlayer.alive).toBeTrue();
    storytellerChooseOneMock.mockResolvedValue(playerDieInstead);
    const death = await mayorPlayer
        .from(demonPlayer)
        .setDead(DeadReason.DemonAttack);
    expect(await mayorPlayer.alive).toBeTrue();
    storytellerChooseOneMock.mockReset();
    expect(death).toBeDefined();
    expect(death.isFor(playerDieInstead)).toBeTrue();
    expect(await playerDieInstead.dead).toBeTrue();

    return death;
}

export async function expectUndertakerToLearn(
    ability: GetUndertakerInformationAbility,
    executedPlayer: IPlayer,
    shouldBeCharacter: CharacterToken,
    _context?: GetInfoAbilityUseContext,
    undertakerPlayer?: UndertakerPlayer,
    characterSheet?: CharacterSheet
) {
    characterSheet ??= mockCharacterSheet();
    const infoProviderContext =
        _context ??
        mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(undertakerPlayer!, []),
            [
                (context) =>
                    mockClocktowerForUndertaker(context, true, executedPlayer),
                (context) => {
                    context.characterSheet = characterSheet!;
                },
            ]
        );
    expect(await ability.isEligible(infoProviderContext)).toBeTrue();

    const info = await expectCharacterGetInformation(
        ability,
        () => infoProviderContext,
        []
    );

    expect(info.character).toBe(shouldBeCharacter);
    expect(info.executedPlayer).toBe(executedPlayer);
}

export async function expectAfterSlayerKill(
    ability: SlayerAbility,
    chosenPlayer: IPlayer,
    shouldBeDead: boolean,
    _context?: AbilityUseContext,
    slayerPlayer?: SlayerPlayer
) {
    const context = _context ?? mockAbilityUseContext(slayerPlayer);

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
        expect(await chosenPlayer.dead).toBeTrue();
    } else {
        expect(result.death).toBeUndefined();
        expect(await chosenPlayer.dead).toBeFalse();
    }

    expect(result.chosenPlayer).toBe(chosenPlayer);
    expect(await ability.isEligible(context)).toBeFalse();
}

export async function expectAfterPoisonerPoison(
    ability: PoisonerAbility,
    chosenPlayer: IPlayer,
    shouldGetPoisoned: boolean,
    _context?: AbilityUseContext,
    poisonerPlayer?: PoisonerPlayer
) {
    const context = _context ?? mockAbilityUseContext(poisonerPlayer);

    expect(await ability.isEligible(context)).toBeTrue();

    chooseMock.mockImplementation(async (_poisonerPlayer, _players) => {
        expect(await _poisonerPlayer.character).toEqual(Poisoner);
        return chosenPlayer;
    });

    const result = (await ability.use(context)) as PoisonerAbilityUseResult;
    chooseMock.mockReset();

    expect(result.poisonedPlayer);

    if (shouldGetPoisoned) {
        expect(result.status).toEqual(AbilitySuccessUseWhenHasEffect);
        expect(result.poisonedPlayer).toBe(chosenPlayer);
        expect(await chosenPlayer.poisoned).toBeTrue();
    } else {
        expect(result.status).toEqual(AbilitySuccessUseWhenMalfunction);
        expect(await chosenPlayer.poisoned).toBeFalse();
    }
}

export async function expectAfterExecute(
    execution: Execution,
    numAlivePlayer: number,
    expectPlayerToBeDead?: IPlayer
): Promise<Death | undefined> {
    const toExecute = await execution.setPlayerAboutToDie(numAlivePlayer);
    if (expectPlayerToBeDead === undefined) {
        expect(toExecute).toBeUndefined();
    } else {
        expect(toExecute).toBe(expectPlayerToBeDead);
    }

    if (expectPlayerToBeDead) {
        storytellerConfirmMock.mockResolvedValue(true);
    }

    const death = await execution.execute();

    if (expectPlayerToBeDead) {
        storytellerConfirmMock.mockReset();
    }

    if (expectPlayerToBeDead === undefined) {
        expect(death).toBeUndefined();
    } else {
        expect(death?.isFor(expectPlayerToBeDead));
    }

    return death;
}

export async function expectScarletWomanBecomeDemonAfterDemonDeath(
    scarletWomanPlayer: ScarletWomanPlayer,
    demonPlayer: DemonPlayer,
    scarletWomanAbility?: ScarletWomanAbility,
    setupContext?: AbilitySetupContext,
    players?: IPlayers,
    deadReason: DeadReason = DeadReason.Other,
    validateGameNotEnd = false
) {
    if (scarletWomanAbility === undefined) {
        scarletWomanAbility = new ScarletWomanAbility();
        players ??= new Players([scarletWomanPlayer, demonPlayer]);
        setupContext ??= mockAbilitySetupContext(scarletWomanPlayer, players);
        await scarletWomanAbility.setup(setupContext);
    }

    storytellerConfirmMock.mockResolvedValue(true);
    const death = await demonPlayer.setDead(deadReason);
    storytellerConfirmMock.mockReset();
    expect(await demonPlayer.dead).toBeTrue();
    expect(await scarletWomanPlayer.characterType).toBe(Demon);
    expect(await scarletWomanPlayer.character).toBe(
        await demonPlayer.character
    );

    if (validateGameNotEnd) {
        const game = createBasicGame();
        const winningAlignment = await game.getWinningTeam(
            setupContext!.players
        );
        expect(winningAlignment).toBeUndefined();
    }

    return death;
}

export async function expectAfterExecuteSaint(
    execution: Execution,
    saintPlayer: SaintPlayer,
    expectGameEnd = true,
    ability?: SaintAbility,
    players?: IPlayers,
    numAlivePlayer?: number,
    setupContext?: SaintAbilitySetupContext,
    useContext?: SaintAbilityUseContext,
    forceExecution = false
) {
    setupContext ??= mockSaintAbilitySetupContext(saintPlayer, players);
    ability ??= await SaintAbility.init(setupContext);
    useContext ??= mockSaintAbilityUseContext(saintPlayer, execution);
    expect(await ability.isEligible(useContext)).toBeTrue();

    const result = await ability.use(useContext);
    const willMalfunction = await ability.willMalfunction(useContext);
    if (willMalfunction) {
        expect(result.status).toBe(AbilitySuccessUseWhenMalfunction);
    } else {
        expect(result.status).toEqual(AbilitySuccessUseWhenHasEffect);
    }

    numAlivePlayer ??= players?.length;

    if (forceExecution) {
        storytellerConfirmMock.mockResolvedValue(true);
        const _death = await execution.execute(saintPlayer);
        storytellerConfirmMock.mockReset();
    } else {
        const _death = await expectAfterExecute(
            execution,
            numAlivePlayer!,
            saintPlayer
        );
    }

    if (expectGameEnd) {
        expect(setupContext.game.setWinningTeam).toHaveBeenCalledOnce();
        expect(setupContext.game.setWinningTeam).toBeCalledWith(
            Alignment.Good,
            expect.any(String)
        );
    } else {
        expect(setupContext.game.setWinningTeam).not.toHaveBeenCalled();
    }
}

export async function mockButlerChooseMaster(
    ability: ButlerAbility,
    master: IPlayer,
    context?: AbilityUseContext,
    butlerPlayer?: IPlayer
) {
    chooseMock.mockResolvedValue(master);
    await ability.use(context ?? mockAbilityUseContext(butlerPlayer));
    chooseMock.mockReset();
}

export async function setupPoisonerAbility(
    poisonerPlayer: PoisonerPlayer,
    poisonerAbility?: PoisonerAbility,
    nightsheet?: NightSheet,
    clocktower?: IClocktower
): Promise<PoisonerAbility> {
    poisonerAbility ??= new PoisonerAbility();

    const setupContext = mockPoisonerAbilitySetupContext(
        poisonerPlayer,
        nightsheet,
        clocktower
    );
    await poisonerAbility.setup(setupContext);

    return poisonerAbility;
}

export async function setupDrunkAbility(
    drunkPlayer: DrunkPlayer,
    thinkAsCharacter: CharacterToken,
    context?: AbilitySetupContext
): Promise<DrunkAbility> {
    const drunkAbility = new DrunkAbility();
    context ??= mockAbilitySetupContext(
        drunkPlayer,
        undefined,
        undefined,
        undefined,
        undefined,
        new AbilityLoader()
    );
    storytellerChooseOneMock.mockResolvedValue(thinkAsCharacter);
    await drunkAbility.setup(context);
    storytellerChooseOneMock.mockReset();
    return drunkAbility;
}

export async function setupMonkProtectAbility(
    monkPlayer: MonkPlayer,
    context?: AbilitySetupContext,
    nightSheet?: NightSheet
): Promise<MonkProtectAbility> {
    const ability = new MonkProtectAbility();

    context ??= mockAbilitySetupContext(
        monkPlayer,
        undefined,
        undefined,
        nightSheet
    );
    await ability.setup(context);
    return ability;
}
