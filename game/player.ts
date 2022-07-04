import { Character } from './character';
import { Nomination } from './nomination';
import { DeadPlayerCannotNominate } from './exception';
import { GameUI } from '~/interaction/gameui';
enum NegativeState {
    None = 0,
    Dead = 1,
    Drunk = 1 << 1,
    Poisoned = 1 << 2,
    Mad = 1 << 3,
}

enum Alignment {
    Good,
    Evil,
}

export class Player {
    hasVoteToken: boolean = true;
    state: number = NegativeState.None;
    readonly canSupportExile: boolean = true;

    get healthy(): boolean {
        return !this.poisoned;
    }

    get poisoned(): boolean {
        return (this.state & NegativeState.Poisoned) === NegativeState.Poisoned;
    }

    get alive(): boolean {
        return !this.dead;
    }

    get dead(): boolean {
        return (this.state & NegativeState.Dead) === NegativeState.Dead;
    }

    get sober(): boolean {
        return !this.drunk;
    }

    get drunk(): boolean {
        return (this.state & NegativeState.Drunk) === NegativeState.Drunk;
    }

    get sane(): boolean {
        return !this.mad;
    }

    get mad(): boolean {
        return (this.state & NegativeState.Mad) === NegativeState.Mad;
    }

    get canNominate(): boolean {
        return this.alive;
    }

    get canVote(): boolean {
        return this.alive || this.hasVoteToken;
    }

    constructor(public character: Character, public alignment: Alignment) {
        this.character = character;
        this.alignment = alignment;
    }

    isAlly(other: Player) {
        return this.alignment === other.alignment;
    }

    *getAllies(players: IterableIterator<Player>): IterableIterator<Player> {
        for (const other of players) {
            if (!Object.is(this, other) && this.isAlly(other)) {
                yield other;
            }
        }
    }

    nominate(nominated: Player): Nomination {
        if (!this.canNominate) {
            throw new DeadPlayerCannotNominate(this);
        }

        return new Nomination(this, nominated);
    }

    collectVote(): boolean {
        if (this.canVote && GameUI.hasRaisedHandForVote(this)) {
            if (this.dead) {
                this.hasVoteToken = false;
            }

            return true;
        }

        return false;
    }
}
