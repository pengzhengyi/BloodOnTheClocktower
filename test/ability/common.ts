import { Monk } from '~/content/characters/output/monk';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    GetCharacterInformationAbility,
    GetInfoAbilityUseContext,
    GetInformationAbilityUseResult,
} from '~/game/ability/ability';
import type {
    MonkProtectAbility,
    MonkAbilityUseResult,
} from '~/game/ability/monk';
import { RecluseAbility } from '~/game/ability/recluse';
import {
    AbilitySuccessCommunicatedInfo,
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
import type { Player } from '~/game/player';
import { StoryTeller } from '~/game/storyteller';
import type {
    AsyncFactory,
    DrunkPlayer,
    ReclusePlayer,
    SlayerPlayer,
    Task,
} from '~/game/types';
import {
    mockAbilitySetupContext,
    mockAbilityUseContext,
    mockGetInfoAbilityUseContext,
} from '~/__mocks__/ability';
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/character-sheet';
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

    expect(result.info).toBeDefined();
    expect(result.status).toEqual(AbilitySuccessCommunicatedInfo);

    return result.info?.info as TInformation;
}

export async function monkProtectPlayer(
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

export async function expectAfterDemonAttack(
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
    expect(death.isFor(playerDieInstead)).toBeTrue();
    expect(playerDieInstead.dead).toBeTrue();

    return death;
}

export async function expectAfterSlayerKill(
    ability: SlayerAbility,
    chosenPlayer: Player,
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
        expect(chosenPlayer.dead).toBeTrue();
    } else {
        expect(result.death).toBeUndefined();
        expect(chosenPlayer.dead).toBeFalse();
    }

    expect(result.chosenPlayer).toBe(chosenPlayer);
    expect(await ability.isEligible(context)).toBeFalse();
}

export async function expectAfterExecute(
    execution: Execution,
    numAlivePlayer: number,
    expectPlayerToBeDead?: Player
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

export async function mockButlerChooseMaster(
    ability: ButlerAbility,
    master: Player,
    context?: AbilityUseContext,
    butlerPlayer?: Player
) {
    chooseMock.mockResolvedValue(master);
    await ability.use(context ?? mockAbilityUseContext(butlerPlayer));
    chooseMock.mockReset();
}

export async function setupDrunk(
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
