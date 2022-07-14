import { Dayjs } from 'dayjs';
import { Nomination as Exile } from './nomination';
import { Vote } from './vote';
import { RoleData } from './types';
import { Player } from './player';
import { Seat } from './seat';
import { Meaning } from './clocktower';
import { Character } from './character';
import { StoryTeller } from './storyteller';
import { Grimoire } from './grimoire';
import { NumberOfCharacters, ScriptConstraints } from './scripttool';
import { CharacterType } from './charactertype';
import { Alignment } from './alignment';

export class BaseError extends Error {
    declare cause?: Error;

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

export class RecoverableGameError extends GameError {}

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(readonly nomination: Exile) {
        super(NoVoteInNomination.description);

        this.nomination = nomination;
    }
}

export class NoVoteInExile extends RecoverableGameError {
    static description = 'Exile does not have a finished vote';

    constructor(readonly exile: Exile) {
        super(NoVoteInExile.description);

        this.exile = exile;
    }
}

export class NoVotesWhenCountingVote extends RecoverableGameError {
    static description = 'Cannot determine who voted when counting votes';

    constructor(readonly vote: Vote, public nomination?: Exile) {
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

    constructor(
        readonly failedNomination: Exile,
        readonly pastNomination: Exile,
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

    constructor(
        readonly failedNomination: Exile,
        readonly pastNomination: Exile,
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

    constructor(readonly player: Player) {
        super(DeadPlayerCannotNominate.description);

        this.player = player;
    }
}

export class NumberOfSeatNotPositive extends RecoverableGameError {
    static description = 'The number of seats must be a positive number';

    constructor(readonly numSeats: number) {
        super(NumberOfSeatNotPositive.description);

        this.numSeats = numSeats;
    }
}

export class UnexpectedEmptySeat extends RecoverableGameError {
    static description = 'Encountered an empty seat unexpected';

    constructor(readonly emptySeat: Seat) {
        super(UnexpectedEmptySeat.description);

        this.emptySeat = emptySeat;
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

    constructor(public nominator: Player, public nominated: Player) {
        super(ExileNonTraveller.description);

        this.nominator = nominator;
        this.nominated = nominated;
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

    constructor(readonly editionName?: string) {
        super(NoEditionMatchingName.description);

        this.editionName = editionName;
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

    constructor(readonly id?: string) {
        super(NoCharacterMatchingId.description);

        this.id = id;
    }
}

export class NoMatchingCharacterType extends RecoverableGameError {
    static description = 'Cannot find a character type matching the name';

    constructor(readonly type?: string) {
        super(NoMatchingCharacterType.description);

        this.type = type;
    }
}

export class BlankGrimoire extends RecoverableGameError {
    static description = 'Grimoire is not initialized';

    constructor(
        readonly storyteller: StoryTeller,
        readonly grimoire?: Grimoire
    ) {
        super(BlankGrimoire.description);

        this.storyteller = storyteller;
        this.grimoire = grimoire;
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
