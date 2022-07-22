import type { Dayjs } from 'dayjs';
import { StackFrame, fromError } from 'stacktrace-js';
import type { Nomination } from './nomination';
import type { Exile } from './exile';
import type { Vote } from './vote';
import type { Predicate, RoleData } from './types';
import type { Player } from './player';
import type { Seat } from './seat';
import type { Meaning } from './clocktower';
import type { Character } from './character';
import type { StoryTeller } from './storyteller';
import type {
    NumberOfCharacters,
    ScriptConstraints,
    ScriptConstraintsHelper,
} from './scripttool';
import {
    CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './charactertype';
import type { Alignment } from './alignment';
import type { Seating } from './seating';
import { GameUI } from '~/interaction/gameui';

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

export class RecoverableGameError extends GameError {
    get handled(): boolean {
        return this.handled_;
    }

    protected handled_ = false;

    async throwWhen(condition: Predicate<this>) {
        if (condition(this)) {
            if (await GameUI.handle(this)) {
                this.handled_ = true;
                if (condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    async resolve() {
        if (await GameUI.handle(this)) {
            this.handled_ = true;
        }
    }
}

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(readonly nomination: Nomination) {
        super(NoVoteInNomination.description);

        this.nomination = nomination;
    }
}

export class NoVoteInExile extends RecoverableGameError {
    static description = 'Exile does not have a finished vote';

    forceAllowExile = false;

    constructor(readonly exile: Exile) {
        super(NoVoteInExile.description);

        this.exile = exile;
    }
}

export class NoVotesWhenCountingVote extends RecoverableGameError {
    static description = 'Cannot determine who voted when counting votes';

    constructor(readonly vote: Vote, public nomination?: Nomination) {
        super(NoVotesWhenCountingVote.description);

        this.vote = vote;
        this.nomination = nomination;
    }
}

export class IncompleteCharacterRoleData extends RecoverableGameError {
    static description = 'Role data is missing required key(s)';

    constructor(
        readonly roleData: Partial<RoleData>,
        readonly missingKeyName: string
    ) {
        super(IncompleteCharacterRoleData.description);

        this.roleData = roleData;
        this.missingKeyName = missingKeyName;
    }
}

export class IncompleteEditionData extends RecoverableGameError {
    static description = 'Edition data is missing required key(s)';

    constructor(
        readonly editionData: Partial<RoleData>,
        readonly missingKeyName: string
    ) {
        super(IncompleteCharacterRoleData.description);

        this.editionData = editionData;
        this.missingKeyName = missingKeyName;
    }
}

export class NominatorNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominator has already nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: Nomination,
        readonly pastNomination: Nomination,
        readonly nominator: Player
    ) {
        super(NominatorNominatedBefore.description);

        this.failedNomination = failedNomination;
        this.pastNomination = pastNomination;
        this.nominator = nominator;
    }
}

export class NominatedNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominated player has already been nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: Nomination,
        readonly pastNomination: Nomination,
        readonly nominated: Player
    ) {
        super(NominatedNominatedBefore.description);

        this.failedNomination = failedNomination;
        this.pastNomination = pastNomination;
        this.nominated = nominated;
    }
}

export class PlayerHasUnclearAlignment extends RecoverableGameError {
    static description =
        'Player does not have a clear alignment as alignment is neither specified nor inferrable';

    constructor(
        readonly player: Player,
        readonly specifiedAlignment?: Alignment
    ) {
        super(PlayerHasUnclearAlignment.description);

        this.player = player;
        this.specifiedAlignment = specifiedAlignment;
    }
}

export class DeadPlayerCannotNominate extends RecoverableGameError {
    static description = 'Dead player cannot nominate';

    forceAllowNomination = false;

    constructor(readonly player: Player) {
        super(DeadPlayerCannotNominate.description);

        this.player = player;
    }
}

export class NumberOfSeatNotPositive extends RecoverableGameError {
    static description = 'The number of seats must be a positive number';

    declare correctedNumSeats: number;

    constructor(readonly numSeats: number) {
        super(NumberOfSeatNotPositive.description);

        this.numSeats = numSeats;
        this.correctedNumSeats = numSeats;
    }
}

export class UnexpectedEmptySeat extends RecoverableGameError {
    static description = 'Encountered an empty seat unexpected';

    get satPlayer(): Player | undefined {
        return this.emptySeat.player;
    }

    constructor(readonly emptySeat: Seat) {
        super(UnexpectedEmptySeat.description);

        this.emptySeat = emptySeat;
    }
}

export class PlayerNotSat extends RecoverableGameError {
    static description = 'Encountered a player without a seat unexpected';

    constructor(readonly player: Player) {
        super(PlayerNotSat.description);

        this.player = player;
    }
}

export class PlayerNoNeighbors extends RecoverableGameError {
    static description =
        'Cannot get two players that sitting nearest to the player';

    constructor(
        readonly player: Player,
        readonly neighbors: [Player | undefined, Player | undefined],
        readonly seating: Seating
    ) {
        super(PlayerNoNeighbors.description);

        this.player = player;
        this.neighbors = neighbors;
        this.seating = seating;
    }
}

export class PlayerNoAliveNeighbors extends PlayerNoNeighbors {
    static description =
        'Cannot get two alive players that sitting nearest to the player';

    constructor(
        readonly player: Player,
        readonly neighbors: [Player | undefined, Player | undefined],
        readonly seating: Seating
    ) {
        super(player, neighbors, seating);
        this.message = PlayerNoAliveNeighbors.description;
    }
}

export class PastMomentRewrite extends RecoverableGameError {
    static description = "Attempt to rewrite a past event's moment";

    constructor(
        readonly meaning: Meaning,
        readonly recordedTimestamp: Dayjs,
        readonly newTimestamp: Dayjs
    ) {
        super(PastMomentRewrite.description);

        this.meaning = meaning;
        this.recordedTimestamp = recordedTimestamp;
        this.newTimestamp = newTimestamp;
    }
}

export class ExileNonTraveller extends RecoverableGameError {
    static description = 'Cannot exile an non-traveller';

    constructor(readonly exile: Exile) {
        super(ExileNonTraveller.description);

        this.exile = exile;
    }
}

export class CannotDetermineCharacterType extends RecoverableGameError {
    static description = 'Cannot determine character type of a character';

    constructor(readonly character: typeof Character, readonly type?: string) {
        super(CannotDetermineCharacterType.description);

        this.character = character;
        this.type = type;
    }
}

export class CharacterLoadFailure extends RecoverableGameError {
    static description = 'Fail to load a character';

    constructor(readonly id: string, readonly reason: Error) {
        super(CharacterLoadFailure.description);

        this.id = id;
        this.from(reason);
    }
}

export class NoEditionMatchingName extends RecoverableGameError {
    static description = 'Cannot find a edition  with matching name';

    declare correctedEditionName: string;

    constructor(readonly editionName?: string) {
        super(NoEditionMatchingName.description);

        this.editionName = editionName;
        if (editionName !== undefined) {
            this.correctedEditionName = editionName;
        }
    }
}

export class EditionLoadFailure extends RecoverableGameError {
    static description = 'Fail to load a edition';

    constructor(readonly editionName: string, readonly reason: Error) {
        super(EditionLoadFailure.description);

        this.editionName = editionName;
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
        readonly loadedCharacters: Array<typeof Character>
    ) {
        super(CharacterLoadFailures.description);

        this.aggregate(failures);
        this.loadedCharacters = loadedCharacters;
    }
}

export class NoCharacterMatchingId extends RecoverableGameError {
    static description = 'Cannot find a character with matching id';

    declare correctedId: string;

    constructor(readonly id?: string) {
        super(NoCharacterMatchingId.description);

        this.id = id;

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

        this.type = type;
        if (type !== undefined) {
            this.correctedType = type;
        }
    }
}

export class BlankGrimoire extends RecoverableGameError {
    static description = "Storyteller's grimoire is not initialized";

    constructor(readonly storyteller: StoryTeller) {
        super(BlankGrimoire.description);

        this.storyteller = storyteller;
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

        this.constraints = constraints;

        if (reason !== undefined) {
            this.from(reason);
        }
    }
}

export class CharacterSheetCreationFailure extends RecoverableGameError {
    static description =
        'Cannot initialize character sheet from provided arguments';

    constructor(
        readonly characters?: Iterable<typeof Character>,
        readonly characterTypes?: Map<
            typeof CharacterType,
            Array<typeof Character>
        >
    ) {
        super(CharacterSheetCreationFailure.description);

        this.characters = characters;
        this.characterTypes = characterTypes;
    }
}

export class TooManyMustIncludedCharacters extends InvalidScriptConstraints {
    static description =
        'The number of characters must include has exceeded the specified number of character for some character type';

    incorrectCharacterTypes: Array<typeof CharacterType> = [];

    constructor(readonly constraintsHelper: ScriptConstraintsHelper) {
        super(constraintsHelper.constraints);
        this.message = TooManyMustIncludedCharacters.description;
        this.constraintsHelper = constraintsHelper;
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
        this.characterType = characterType;
        this.requiredNumber = requiredNumber;
    }
}

export class IncorrectAlignmentForSpyToRegisterAs extends RecoverableGameError {
    static description = 'The spy should only register as good or evil';

    declare correctedAlignmentToRegisterAs: Alignment;

    constructor(
        readonly characterToRegisterAs: typeof Character,
        readonly alignmentToRegisterAs?: Alignment
    ) {
        super(IncorrectAlignmentForSpyToRegisterAs.description);
        this.characterToRegisterAs = characterToRegisterAs;
        this.alignmentToRegisterAs = alignmentToRegisterAs;

        if (alignmentToRegisterAs !== undefined) {
            this.correctedAlignmentToRegisterAs = alignmentToRegisterAs;
        }
    }
}

export class FortuneTellerChooseInvalidPlayers extends RecoverableGameError {
    static description =
        'The fortune teller has not chosen two players to detect';

    declare corrected: [Player, Player];

    constructor(readonly chosen: Array<Player> | undefined) {
        super(FortuneTellerChooseInvalidPlayers.description);

        this.chosen = chosen;
    }
}
