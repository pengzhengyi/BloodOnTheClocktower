import { createInfoProvideContext } from '../info-provider.test';
import { Monk } from '~/content/characters/output/monk';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    GetCharacterInformationAbility,
    GetInfoAbilityUseContext,
    GetInformationAbilityUseResult,
} from '~/game/ability/ability';
import { MonkProtectAbility, MonkAbilityUseResult } from '~/game/ability/monk';
import { RecluseAbility } from '~/game/ability/recluse';
import {
    AbilitySuccessCommunicatedFalseInfo,
    AbilitySuccessCommunicatedInfo,
    AbilitySuccessUseWhenHasEffect,
    AbilitySuccessUseWhenMalfunction,
    AbilityUseStatus,
} from '~/game/ability/status';
import { Generator } from '~/game/collections';
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
    DrunkPlayer,
    MonkPlayer,
    PoisonerPlayer,
    ReclusePlayer,
    SaintPlayer,
    SlayerPlayer,
    Task,
    UndertakerPlayer,
} from '~/game/types';
import {
    mockAbilitySetupContext,
    mockAbilityUseContext,
    mockGetInfoAbilityUseContext,
    mockSaintAbilitySetupContext,
    mockSaintAbilityUseContext,
} from '~/__mocks__/ability';
import {
    getTroubleBrewingCharacterSheet,
    mockCharacterSheet,
} from '~/__mocks__/character-sheet';
import { chooseMock, storytellerChooseOneMock } from '~/__mocks__/game-ui';
import { Slayer } from '~/content/characters/output/slayer';
import type {
    SlayerAbility,
    SlayerAbilityUseResult,
} from '~/game/ability/slayer';
import type { Execution } from '~/game/execution';
import type { ButlerAbility } from '~/game/ability/butler';
import { DrunkAbility } from '~/game/ability/drunk';
import { AbilityLoader } from '~/game/ability/loader';
import {
    PoisonerAbility,
    PoisonerAbilityUseResult,
} from '~/game/ability/poisoner';
import { Poisoner } from '~/content/characters/output/poisoner';
import type { NightSheet } from '~/game/night-sheet';
import { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import { mockClocktowerForUndertaker } from '~/__mocks__/information';
import {
    SaintAbility,
    SaintAbilitySetupContext,
    SaintAbilityUseContext,
} from '~/game/ability/saint';
import type { Players } from '~/game/players';

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
    demonPlayer: IPlayer,
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

    const death = await execution.execute();
    if (expectPlayerToBeDead === undefined) {
        expect(death).toBeUndefined();
    } else {
        expect(death?.isFor(expectPlayerToBeDead));
    }

    return death;
}

export async function expectAfterExecuteSaint(
    execution: Execution,
    saintPlayer: SaintPlayer,
    expectGameEnd = true,
    ability?: SaintAbility,
    players?: Players,
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
        const _death = await execution.execute(saintPlayer);
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
