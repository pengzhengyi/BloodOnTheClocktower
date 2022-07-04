import { Nomination } from './nomination';
import { Vote } from './vote';
import { RoleData } from './types';
import { Player } from './player';

export class GameError extends Error {}

export class RecoverableGameError extends GameError {}

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(public nomination: Nomination) {
        super(NoVoteInNomination.description);

        this.nomination = nomination;
    }
}

export class NoVotesWhenCountingVote extends RecoverableGameError {
    static description = 'Cannot determine who voted when counting votes';

    constructor(public vote: Vote, public nomination?: Nomination) {
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
        'nomination failed because the nominator has already nominated in past nominations';

    constructor(
        public failedNomination: Nomination,
        public pastNomination: Nomination,
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
        'nomination failed because the nominated player has already been nominated in past nominations';

    constructor(
        public failedNomination: Nomination,
        public pastNomination: Nomination,
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
