import { Dayjs } from 'dayjs';
import { fromError, StackFrame } from 'stacktrace-js';
import type { Execution } from './execution';
import type { NightActOrdering } from './night-sheet';
import type { Nomination } from './nomination';
import type { Exile } from './exile';
import type { Vote } from './vote';
import type {
    AsyncFactory,
    ButlerPlayer,
    FortuneTellerPlayer,
    MonkPlayer,
    Predicate,
    RoleData,
    RavenkeeperPlayer,
    SlayerPlayer,
    StaticThis,
    UndertakerPlayer,
    AsyncPredicate,
    PoisonerPlayer,
    ImpPlayer,
} from './types';
import type { IPlayer } from './player';
import type { Players } from './players';
import type { ISeat } from './seating/seat';
import type { CharacterToken } from './character';
import type { StoryTeller } from './storyteller';
import type {
    NumberOfCharacters,
    ScriptConstraints,
    ScriptConstraintsHelper,
} from './script-tool';
import {
    CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character-type';
import type { IEffect } from './effect/effect';
import type { Alignment } from './alignment';
import type { IEffects } from './effect/effects';
import type { ISeating } from './seating/seating';
import { GamePhaseKind } from './game-phase-kind';
import type {
    AbilityUseContext,
    AbilityUseResult,
    AbilitySetupContext,
    IAbility,
    GetInfoAbilityUseContext,
} from './ability/ability';
import type { InfoRequestContext } from './info/requester/requester';
import type { InfoProviderLoader } from './info/provider/loader';
import type { IDiary, Event as ClocktowerEvent } from './diary';
import type { TCharacterEffect } from './effect/character';
import { InteractionEnvironment } from '~/interaction/environment';

export class BaseError extends Error {
    declare cause?: Error;

    getStackFrames(): Promise<Array<StackFrame>> {
        return fromError(this);
    }

    from(error: Error): this {
        this.cause = error;
        return this;
    }

    aggregate<E extends Error = BaseError>(errors: Iterable<E>): this {
        if (this.cause instanceof AggregateError) {
            this.cause.aggregate(errors);
        } else {
            this.cause = new AggregateError<E>().aggregate(errors);
        }

        return this;
    }

    throw(): never {
        // eslint-disable-next-line no-throw-literal
        throw this;
    }

    throwWhen(condition: Predicate<this>) {
        if (condition(this)) {
            this.throw();
        }
    }
}

export class AggregateError<E extends Error = BaseError> extends Error {
    readonly errors: Array<E> = [];

    get cause(): Error | undefined {
        return this.errors[0];
    }

    aggregate(errors: Iterable<E>) {
        this.errors.push(...errors);
        return this;
    }
}

export class GameError extends BaseError {}

// eslint-disable-next-line no-use-before-define
export type RecoveryAction<TError extends RecoverableGameError, TResult> = (
    error: TError
) => Promise<TResult>;

export class RecoverableGameError extends GameError {
    static async catch<TError extends RecoverableGameError, TResult>(
        this: StaticThis<TError>,
        action: AsyncFactory<TResult>,
        recovery: RecoveryAction<TError, TResult>
    ): Promise<TResult> {
        try {
            return await action();
        } catch (error) {
            if (error instanceof this) {
                await error.resolve();
                return await recovery(error);
            }

            throw error;
        }
    }

    get handled(): boolean {
        return this.handled_;
    }

    protected handled_ = false;

    async throwWhen(condition: Predicate<this>) {
        if (condition(this)) {
            if (await InteractionEnvironment.current.gameUI.handle(this)) {
                this.handled_ = true;
                if (condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    async throwWhenAsync(condition: AsyncPredicate<this>) {
        if (await condition(this)) {
            if (await InteractionEnvironment.current.gameUI.handle(this)) {
                this.handled_ = true;
                if (await condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    async resolve() {
        if (await InteractionEnvironment.current.gameUI.handle(this)) {
            this.handled_ = true;
        }
    }
}

export class UnsupportedOperation extends RecoverableGameError {
    static description = 'Operation not supported';

    constructor(readonly additionalDescription?: string) {
        super(
            UnsupportedOperation.description + additionalDescription ===
                undefined
                ? ''
                : `: ${additionalDescription}`
        );
    }
}

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(readonly nomination: Nomination) {
        super(NoVoteInNomination.description);
    }
}

export class AttemptMoreThanOneExecution extends RecoverableGameError {
    static description = 'There is a maximum of one execution per day';

    constructor(
        readonly execution: Execution,
        readonly executed: IPlayer,
        readonly attemptedToExecute: IPlayer
    ) {
        super(AttemptMoreThanOneExecution.description);
    }
}

export class NoVoteInExile extends RecoverableGameError {
    static description = 'Exile does not have a finished vote';

    forceAllowExile = false;

    constructor(readonly exile: Exile) {
        super(NoVoteInExile.description);
    }
}

export class NoVotesWhenCountingVote extends RecoverableGameError {
    static description = 'Cannot determine who voted when counting votes';

    constructor(readonly vote: Vote, public nomination?: Nomination) {
        super(NoVotesWhenCountingVote.description);
    }
}

export class IncompleteCharacterRoleData extends RecoverableGameError {
    static description = 'Role data is missing required key(s)';

    constructor(
        readonly roleData: Partial<RoleData>,
        readonly missingKeyName: string
    ) {
        super(IncompleteCharacterRoleData.description);
    }
}

export class IncompleteEditionData extends RecoverableGameError {
    static description = 'Edition data is missing required key(s)';

    constructor(
        readonly editionData: Partial<RoleData>,
        readonly missingKeyName: string
    ) {
        super(IncompleteCharacterRoleData.description);
    }
}

export class NominatorNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominator has already nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: Nomination,
        readonly pastNomination: Nomination,
        readonly nominator: IPlayer
    ) {
        super(NominatorNominatedBefore.description);
    }
}

export class NominatedNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominated player has already been nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: Nomination,
        readonly pastNomination: Nomination,
        readonly nominated: IPlayer
    ) {
        super(NominatedNominatedBefore.description);
    }
}

export class PlayerHasUnclearAlignment extends RecoverableGameError {
    static description =
        'IPlayer does not have a clear alignment as alignment is neither specified nor inferrable';

    declare correctedAlignment: Alignment;

    constructor(
        readonly player: IPlayer,
        readonly specifiedAlignment?: Alignment
    ) {
        super(PlayerHasUnclearAlignment.description);
    }
}

export class DeadPlayerCannotNominate extends RecoverableGameError {
    static description = 'Dead player cannot nominate';

    forceAllowNomination = false;

    constructor(readonly player: IPlayer) {
        super(DeadPlayerCannotNominate.description);
    }
}

export class NumberOfSeatNotPositive extends RecoverableGameError {
    static description = 'The number of seats must be a positive number';

    declare correctedNumSeats: number;

    constructor(readonly seating: ISeating, readonly numSeats: number) {
        super(NumberOfSeatNotPositive.description);
        this.correctedNumSeats = numSeats;
    }
}

export class UnexpectedEmptySeat extends RecoverableGameError {
    static description = 'Encountered an empty seat unexpected';

    get satPlayer(): IPlayer | undefined {
        return this.emptySeat.player;
    }

    constructor(readonly seating: ISeating, readonly emptySeat: ISeat) {
        super(UnexpectedEmptySeat.description);
    }
}

export class PlayerNotSat extends RecoverableGameError {
    static description = 'Encountered a player without a seat unexpected';

    constructor(readonly player: IPlayer) {
        super(PlayerNotSat.description);
    }
}

export class InvalidPlayerToSit extends RecoverableGameError {
    static description = 'Try to sit an invalid player';

    declare correctedPlayer: IPlayer;

    constructor(readonly player: IPlayer) {
        super(PlayerNotSat.description);
    }
}

export class AccessInvalidSeatPosition extends RecoverableGameError {
    static description = 'Cannot get seat for an invalid position';

    constructor(readonly position: number, readonly seating: ISeating) {
        super(AccessInvalidSeatPosition.description);
    }
}

export class PlayerNoNeighbors extends RecoverableGameError {
    static description =
        'Cannot get two players that sitting nearest to the player';

    constructor(
        readonly player: IPlayer,
        readonly neighbors: [IPlayer | undefined, IPlayer | undefined],
        readonly seating: ISeating
    ) {
        super(PlayerNoNeighbors.description);
    }
}

export class PlayerNoAliveNeighbors extends PlayerNoNeighbors {
    static description =
        'Cannot get two alive players that sitting nearest to the player';

    constructor(
        readonly player: IPlayer,
        readonly neighbors: [IPlayer | undefined, IPlayer | undefined],
        readonly seating: ISeating
    ) {
        super(player, neighbors, seating);
        this.message = PlayerNoAliveNeighbors.description;
    }
}

export class ExileNonTraveller extends RecoverableGameError {
    static description = 'Cannot exile an non-traveller';

    constructor(readonly exile: Exile) {
        super(ExileNonTraveller.description);
    }
}

export class CannotDetermineCharacterType extends RecoverableGameError {
    static description = 'Cannot determine character type of a character';

    constructor(
        readonly player?: IPlayer,
        readonly character?: CharacterToken,
        readonly type?: string
    ) {
        super(CannotDetermineCharacterType.description);
    }
}

export class CharacterLoadFailure extends RecoverableGameError {
    static description = 'Fail to load a character';

    constructor(readonly id: string, readonly reason: Error) {
        super(CharacterLoadFailure.description);
        this.from(reason);
    }
}

export class CharacterNotInNightActOrdering extends RecoverableGameError {
    static description = "character not in night sheet's acting order";

    constructor(
        readonly character: CharacterToken,
        readonly nightActOrdering: NightActOrdering
    ) {
        super(CharacterNotInNightActOrdering.description);
    }
}

export class ReassignCharacterToPlayer extends RecoverableGameError {
    static description =
        'player already has an assigned character, confirm to reassign';

    shouldReassign = false;

    constructor(
        readonly player: IPlayer,
        readonly existingCharacter: CharacterToken,
        readonly newCharacter: CharacterToken
    ) {
        super(ReassignCharacterToPlayer.description);
    }
}

export class PlayerCharacterTypeBecomeUndefined extends RecoverableGameError {
    static description =
        'player character type unexpectedly change to undefined';

    constructor(
        readonly player: IPlayer,
        readonly previousCharacterType: typeof CharacterType,
        readonly newCharacterType: undefined,
        readonly reason?: string
    ) {
        super(PlayerCharacterTypeBecomeUndefined.description);
    }
}

export class IncorrectNumberOfCharactersToAssign extends RecoverableGameError {
    static description =
        'the number of characters to assign does not match the number of players';

    constructor(
        readonly players: Players,
        readonly characters: Array<CharacterToken>
    ) {
        super(IncorrectNumberOfCharactersToAssign.description);
    }
}

export class NoEditionMatchingName extends RecoverableGameError {
    static description = 'Cannot find a edition with matching name';

    declare correctedEditionName: string;

    constructor(readonly editionName?: string) {
        super(NoEditionMatchingName.description);

        if (editionName !== undefined) {
            this.correctedEditionName = editionName;
        }
    }
}

export class EditionLoadFailure extends RecoverableGameError {
    static description = 'Fail to load a edition';

    constructor(readonly editionName: string, readonly reason: Error) {
        super(EditionLoadFailure.description);
        this.from(reason);
    }
}

export class CharacterLoadFailures<
    E extends Error = GameError
> extends RecoverableGameError {
    static description = 'Fail to load some characters';

    declare cause: AggregateError<E>;

    get failures() {
        return this.cause.errors;
    }

    constructor(
        failures: Iterable<E>,
        readonly loadedCharacters: Array<CharacterToken>
    ) {
        super(CharacterLoadFailures.description);

        this.aggregate(failures);
    }
}

export class NoCharacterMatchingId extends RecoverableGameError {
    static description = 'Cannot find a character with matching id';

    declare correctedId: string;

    constructor(readonly id?: string) {
        super(NoCharacterMatchingId.description);

        if (id !== undefined) {
            this.correctedId = id;
        }
    }
}

export class NoMatchingCharacterType extends RecoverableGameError {
    static description = 'Cannot find a character type matching the name';

    declare correctedType: string;

    constructor(readonly type?: string) {
        super(NoMatchingCharacterType.description);

        if (type !== undefined) {
            this.correctedType = type;
        }
    }
}

export class BlankGrimoire extends RecoverableGameError {
    static description = "Storyteller's grimoire is not initialized";

    constructor(readonly storyteller: StoryTeller) {
        super(BlankGrimoire.description);
    }
}

export class InvalidScriptConstraints extends RecoverableGameError {
    static description = 'Some script constraints are invalid';

    constructor(
        readonly constraints: Partial<ScriptConstraints>,
        reason?: Error,
        details = ''
    ) {
        super(InvalidScriptConstraints.description + details);

        if (reason !== undefined) {
            this.from(reason);
        }
    }
}

export class CharacterSheetCreationFailure extends RecoverableGameError {
    static description =
        'Cannot initialize character sheet from provided arguments';

    constructor(
        readonly characters?: Iterable<CharacterToken>,
        readonly characterTypes?: Map<
            typeof CharacterType,
            Array<CharacterToken>
        >
    ) {
        super(CharacterSheetCreationFailure.description);
    }
}

export class TooManyMustIncludedCharacters extends InvalidScriptConstraints {
    static description =
        'The number of characters must include has exceeded the specified number of character for some character type';

    incorrectCharacterTypes: Array<typeof CharacterType> = [];

    constructor(readonly constraintsHelper: ScriptConstraintsHelper) {
        super(constraintsHelper.constraints);
        this.message = TooManyMustIncludedCharacters.description;
    }

    protected validate(): boolean {
        this.incorrectCharacterTypes = [];
        const simplified = this.constraintsHelper.simplify();
        let result = false;

        if (simplified.townsfolk < 0) {
            this.incorrectCharacterTypes.push(Townsfolk);
            result = true;
        }

        if (simplified.outsider < 0) {
            this.incorrectCharacterTypes.push(Outsider);
            result = true;
        }

        if (simplified.minion < 0) {
            this.incorrectCharacterTypes.push(Minion);
            result = true;
        }

        if (simplified.demon < 0) {
            this.incorrectCharacterTypes.push(Demon);
            result = true;
        }

        if (simplified.traveller < 0) {
            this.incorrectCharacterTypes.push(Traveller);
            result = true;
        }

        return result;
    }

    validateOrThrow() {
        return this.throwWhen((error) => error.validate());
    }
}

export class NegativeNumberForCharacterTypeInScriptConstraint extends InvalidScriptConstraints {
    static description =
        'The number of character for any character type must not be negative';

    constructor(
        readonly constraints: NumberOfCharacters,
        readonly characterType: CharacterType,
        readonly requiredNumber: number
    ) {
        super(constraints);
        this.message =
            NegativeNumberForCharacterTypeInScriptConstraint.description;
    }
}

export class IncorrectAlignmentForSpyToRegisterAs extends RecoverableGameError {
    static description = 'The spy should only register as good or evil';

    declare correctedAlignmentToRegisterAs: Alignment;

    constructor(
        readonly characterToRegisterAs: CharacterToken,
        readonly alignmentToRegisterAs?: Alignment
    ) {
        super(IncorrectAlignmentForSpyToRegisterAs.description);

        if (alignmentToRegisterAs !== undefined) {
            this.correctedAlignmentToRegisterAs = alignmentToRegisterAs;
        }
    }
}

export class AbilityRequiresSetup<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext
> extends RecoverableGameError {
    static description = 'Ability requires setup before use';

    constructor(
        readonly ability: IAbility<
            TAbilityUseContext,
            TAbilityUseResult,
            TAbilitySetupContext
        >,
        readonly context: TAbilityUseContext
    ) {
        super(AbilityRequiresSetup.description);
    }
}

export class AbilityCanOnlyUseOnce<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext
> extends RecoverableGameError {
    static description = 'Ability can be used once per game';

    constructor(
        readonly ability: IAbility<
            TAbilityUseContext,
            TAbilityUseResult,
            TAbilitySetupContext
        >,
        readonly context: TAbilityUseContext
    ) {
        super(AbilityCanOnlyUseOnce.description);
    }
}

export class FortuneTellerChooseInvalidPlayers extends RecoverableGameError {
    static description =
        'The fortune teller has not chosen two players to detect';

    declare corrected: [IPlayer, IPlayer];

    constructor(
        readonly fortuneTellerPlayer: FortuneTellerPlayer,
        readonly chosen: Array<IPlayer> | undefined,
        readonly context: GetInfoAbilityUseContext
    ) {
        super(FortuneTellerChooseInvalidPlayers.description);
    }
}

export class MonkNotChoosePlayerToProtect extends RecoverableGameError {
    static description = 'The monk has not chosen player to protect';

    declare correctedPlayerToProtect: IPlayer;

    constructor(
        readonly monkPlayer: MonkPlayer,
        readonly context: AbilityUseContext
    ) {
        super(MonkNotChoosePlayerToProtect.description);
    }
}

export class PoisonerNotChoosePlayerToPoison extends RecoverableGameError {
    static description = 'The poisoner has not chosen player to poison';

    declare correctedPlayerToPoison: IPlayer;

    constructor(
        readonly poisonerPlayer: PoisonerPlayer,
        readonly context: AbilityUseContext
    ) {
        super(PoisonerNotChoosePlayerToPoison.description);
    }
}

export class ImpNotChoosePlayerToKill extends RecoverableGameError {
    static description = 'The imp has not chosen player to poison';

    declare correctedPlayerToKill: IPlayer;

    constructor(
        readonly impPlayer: ImpPlayer,
        readonly context: AbilityUseContext
    ) {
        super(ImpNotChoosePlayerToKill.description);
    }
}

export class SlayerNotChoosePlayerToKill extends RecoverableGameError {
    static description = 'The slayer has not chosen player to kill';

    declare correctedPlayerToKill: IPlayer;

    constructor(
        readonly slayerPlayer: SlayerPlayer,
        readonly context: AbilityUseContext
    ) {
        super(SlayerNotChoosePlayerToKill.description);
    }
}

export class ButlerNotChooseMasterToFollow extends RecoverableGameError {
    static description = 'The butler has not chosen master to follow on vote';

    declare correctedMaster: IPlayer;

    constructor(
        readonly butlerPlayer: ButlerPlayer,
        readonly context: AbilityUseContext
    ) {
        super(ButlerNotChooseMasterToFollow.description);
    }
}

export class RavenkeeperNotChoosePlayerToProtect extends RecoverableGameError {
    static description =
        'The ravenkeeper has not chosen player to learn the character';

    declare correctedPlayer: IPlayer;

    constructor(
        readonly RavenkeeperPlayer: RavenkeeperPlayer,
        readonly context: AbilityUseContext
    ) {
        super(RavenkeeperNotChoosePlayerToProtect.description);
    }
}

export class UndertakerRequestInfoWhenNoExecution extends RecoverableGameError {
    static description =
        'The undertaker cannot get information when there was no execution today';

    declare corrected: [IPlayer, IPlayer];

    constructor(
        readonly undertakerPlayer: UndertakerPlayer,
        readonly context: GetInfoAbilityUseContext
    ) {
        super(UndertakerRequestInfoWhenNoExecution.description);
    }
}

export class RecallFutureDate extends RecoverableGameError {
    static description =
        'Trying to recall a future date not experienced in game';

    constructor(readonly requestedDate: number, readonly furthestDate: number) {
        super(RecallFutureDate.description);
    }
}

export class CannotGetEffectPriority<
    T extends object
> extends RecoverableGameError {
    static description =
        'Cannot get priority of an effect for specified game phase';

    constructor(
        readonly effect: IEffect<T>,
        readonly gamePhaseKind: GamePhaseKind
    ) {
        super(CannotGetEffectPriority.description);
    }
}

export class EffectsNotSetup<
    TTarget extends object,
    TGetPriorityContext = any
> extends RecoverableGameError {
    static description =
        'Effects has not setup game phase based priority ordering';

    constructor(readonly effects: IEffects<TTarget, TGetPriorityContext>) {
        super(EffectsNotSetup.description);
    }
}

export class CharacterEffectOriginNotSetup<
    TTarget extends object
> extends RecoverableGameError {
    static description =
        'Character effect has not setup its effect origin (the character that applied this effect)';

    constructor(readonly effect: TCharacterEffect<TTarget>) {
        super(CharacterEffectOriginNotSetup.description);
    }
}

export class RecallFutureEvent extends RecoverableGameError {
    static description =
        'Trying to recall a future event not experienced in game';

    constructor(
        readonly requestedDate: number,
        readonly requestedEvent: ClocktowerEvent,
        readonly furthestDate: number
    ) {
        super(RecallFutureEvent.description);
    }
}

export class PastMomentRewrite extends RecoverableGameError {
    static description = "Attempt to rewrite a past event's moment";

    constructor(
        readonly diary: IDiary,
        readonly event: ClocktowerEvent,
        readonly recordedTimestamp: Dayjs,
        readonly newTimestamp: Dayjs
    ) {
        super(PastMomentRewrite.description);
    }
}

export class RecordUnknownEventInDiary extends RecoverableGameError {
    static description =
        'Attempt to record an event that is not one of known types';

    constructor(
        readonly diary: IDiary,
        readonly event: ClocktowerEvent,
        readonly moment: Dayjs
    ) {
        super(RecordUnknownEventInDiary.description);
    }
}

export class EventNotExistInDate extends RecoverableGameError {
    static description = 'Provided event does not exist in given date';

    constructor(readonly event: ClocktowerEvent, readonly diary: IDiary) {
        super(EventNotExistInDate.description);
    }
}

export class NoDefinedInfoProvider<
    InfoType,
    TInformation
> extends RecoverableGameError {
    static description =
        'Cannot process an information request because there is no associated info provider';

    correctedInfo?: InfoType;

    constructor(
        readonly context: InfoRequestContext<TInformation>,
        readonly infoProviderLoader: InfoProviderLoader
    ) {
        super(NoDefinedInfoProvider.description);
    }
}

export class GameHasTooManyPlayers extends RecoverableGameError {
    static description = 'Game has too many players';

    constructor(
        readonly numPlayers: number,
        readonly recommendedMaximum: number
    ) {
        super(GameHasTooManyPlayers.description);
    }
}

export class GameHasTooFewPlayers extends RecoverableGameError {
    static description = 'Game has too few players';

    constructor(
        readonly numPlayers: number,
        readonly recommendedMinimum: number
    ) {
        super(GameHasTooFewPlayers.description);
    }
}
