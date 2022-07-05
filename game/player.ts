import { Character } from './character';
import { Nomination } from './nomination';
import { DeadPlayerCannotNominate } from './exception';
import { Alignment } from './alignment';
import { Demon, Traveller } from './charactertype';
import { GameUI } from '~/interaction/gameui';

enum NegativeState {
    None = 0,
    /**
     * {@link `glossory["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    Dead = 1,
    /**
     * {@link `glossory["Drunk"]`}
     *  A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    Drunk = 1 << 1,
    Poisoned = 1 << 2,
    /**
     * {@link `glossory["Mad"]`}
     * A player who is “mad” about something is trying to convince the group that something is true. Some players are instructed to be mad about something - if the Storyteller thinks that a player has not put effort to convince the group of the thing they are mad about, then a penalty may apply. Some players are instructed to not be mad about something - if the Storyteller thinks that a player has tried to convince the group of that thing, then a penalty may apply.
     */
    Mad = 1 << 3,
}

export class Player {
    hasVoteToken: boolean = true;
    state: number = NegativeState.None;
    readonly canSupportExile: boolean = true;

    /**
     * {@link `glossory["Healthy"]`}
     * Not poisoned.
     */
    get healthy(): boolean {
        return !this.poisoned;
    }

    get poisoned(): boolean {
        return (this.state & NegativeState.Poisoned) === NegativeState.Poisoned;
    }

    /**
     * {@link `glossory["Alive"]`}
     * A player that has not died. Alive players have their ability, may vote as many times as they wish, and may nominate players. As long as 3 or more players are alive, the game continues.
     */
    get alive(): boolean {
        return !this.dead;
    }

    /**
     * {@link `glossory["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    get dead(): boolean {
        return (this.state & NegativeState.Dead) === NegativeState.Dead;
    }

    get sober(): boolean {
        return !this.drunk;
    }

    /**
     * {@link `glossory["Drunk"]`}
     *  A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
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

    get isTraveller(): boolean {
        return Object.is(this.character.characterType, Traveller);
    }

    /**
     * {@link `glossory["Demon, The"]`}
     * The player that has the Demon character. In a game with multiple Demons, each alive Demon player counts as “The Demon”.
     */
    get isTheDemon(): boolean {
        return this.alive && Object.is(this.character.characterType, Demon);
    }

    get isAliveNontraveller(): boolean {
        return this.alive && !this.isTraveller;
    }

    constructor(public character: Character, public alignment: Alignment) {
        this.character = character;
        this.alignment = alignment;
    }

    isAlly(other: Player) {
        return this.alignment === other.alignment;
    }

    *getAllies(players: Iterable<Player>): Iterable<Player> {
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

    collectVote(forExile: boolean): boolean {
        const shouldCheckHandRaised =
            (forExile && this.canSupportExile) || this.canVote;
        if (shouldCheckHandRaised && GameUI.hasRaisedHandForVote(this)) {
            if (this.dead) {
                this.hasVoteToken = false;
            }

            return true;
        }

        return false;
    }
}

export interface MinionPlayer extends Player {}
export interface DemonPlayer extends Player {}
