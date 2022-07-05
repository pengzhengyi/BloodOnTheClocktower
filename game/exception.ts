import { Dayjs } from 'dayjs';
import { Nomination as Exile } from './nomination';
import { Vote } from './vote';
import { RoleData } from './types';
import { Player } from './player';
import { Seat } from './seat';
import { Meaning } from './clocktower';
import { Character } from './character';

export class GameError extends Error {}

export class RecoverableGameError extends GameError {}

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(public nomination: Exile) {
        super(NoVoteInNomination.description);

        this.nomination = nomination;
    }
}

export class NoVoteInExile extends RecoverableGameError {
    static description = 'Exile does not have a finished vote';

    constructor(public exile: Exile) {
        super(NoVoteInExile.description);

        this.exile = exile;
    }
}

export class NoVotesWhenCountingVote extends RecoverableGameError {
    static description = 'Cannot determine who voted when counting votes';

    constructor(public vote: Vote, public nomination?: Exile) {
        super(NoVotesWhenCountingVote.description);

        this.vote = vote;
        this.nomination = nomination;
    }
}

export class IncompleteCharacterRoleData extends RecoverableGameError {
    static description = 'Role data is missing required key(s)';

    constructor(
        public roleData: Partial<RoleData>,
        public missingKeyName: string
    ) {
        super(IncompleteCharacterRoleData.description);

        this.roleData = roleData;
        this.missingKeyName = missingKeyName;
    }
}

export class NominatorNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominator has already nominated in past nominations';

    constructor(
        public failedNomination: Exile,
        public pastNomination: Exile,
        public nominator: Player
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
        public failedNomination: Exile,
        public pastNomination: Exile,
        public nominated: Player
    ) {
        super(NominatedNominatedBefore.description);

        this.failedNomination = failedNomination;
        this.pastNomination = pastNomination;
        this.nominated = nominated;
    }
}

export class DeadPlayerCannotNominate extends RecoverableGameError {
    static description = 'Dead player cannot nominate';

    constructor(public player: Player) {
        super(DeadPlayerCannotNominate.description);

        this.player = player;
    }
}

export class NumberOfSeatNotPositive extends RecoverableGameError {
    static description = 'The number of seats must be a positive number';

    constructor(public numSeats: number) {
        super(NumberOfSeatNotPositive.description);

        this.numSeats = numSeats;
    }
}

export class UnexpectedEmptySeat extends RecoverableGameError {
    static description = 'Encountered an empty seat unexpected';

    constructor(public emptySeat: Seat) {
        super(UnexpectedEmptySeat.description);

        this.emptySeat = emptySeat;
    }
}

export class PastMomentRewrite extends RecoverableGameError {
    static description = "Attempt to rewrite a past event's moment";

    constructor(
        public meaning: Meaning,
        public recordedTimestamp: Dayjs,
        public newTimestamp: Dayjs
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

    constructor(public character: Character) {
        super(ExileNonTraveller.description);

        this.character = character;
    }
}
