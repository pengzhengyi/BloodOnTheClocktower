import '@abraham/reflection';
import { Expose, Exclude, instanceToPlain } from 'class-transformer';
import { Generator, LazyMap } from '../collections';

export enum State {
    None = 0,
    /**
     * {@link `glossary["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    Dead = 1,

    /**
     * {@link `glossary["Drunk"]`}
     * A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    Drunk = 2 /* 1 << 1 */,

    /**
     * {@link `glossary["Poisoned"]`}
     * A poisoned player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Poisoned players do not know they are poisoned. See Drunk.
     */
    Poisoned = 4 /* 1 << 2 */,

    /**
     * {@link `glossary["Mad"]`}
     * A player who is “mad” about something is trying to convince the group that something is true. Some players are instructed to be mad about something - if the Storyteller thinks that a player has not put effort to convince the group of the thing they are mad about, then a penalty may apply. Some players are instructed to not be mad about something - if the Storyteller thinks that a player has tried to convince the group of that thing, then a penalty may apply.
     */
    Mad = 8 /* 1 << 3 */,
}

export type NegativeState = Exclude<State, State.None>;

export interface IPlayerState {
    readonly drunk: boolean;
    readonly sober: boolean;
    readonly poisoned: boolean;
    readonly healthy: boolean;
    readonly alive: boolean;
    readonly dead: boolean;
    readonly mad: boolean;
    readonly sane: boolean;
    toString(): string;
}

@Exclude()
export class PlayerState implements IPlayerState {
    static get NEGATIVE_STATES(): Iterable<NegativeState> {
        return Generator.filter(
            (state) => !isNaN(Number(state)) && state > 0,
            Object.values(State)
        ) as Iterable<NegativeState>;
    }

    static getStateName(negativeState: NegativeState): string {
        return State[negativeState];
    }

    static getOppositeStateName(negativeState: NegativeState): string {
        switch (negativeState) {
            case State.Dead:
                return 'Alive';
            case State.Drunk:
                return 'Sober';
            case State.Poisoned:
                return 'Healthy';
            case State.Mad:
                return 'Sane';
            default:
                return `Not ${this.getStateName(negativeState)}`;
        }
    }

    /**
     * {@link `glossary["Drunk"]`}
     *  A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    get drunk(): boolean {
        return this.hasNegativeState(State.Drunk);
    }

    /**
     * {@link `glossary["Sober"]`}
     * Not drunk.
     */
    get sober(): boolean {
        return !this.drunk;
    }

    get poisoned(): boolean {
        return this.hasNegativeState(State.Poisoned);
    }

    /**
     * {@link `glossary["Healthy"]`}
     * Not poisoned.
     */
    get healthy(): boolean {
        return !this.poisoned;
    }

    /**
     * {@link `glossary["Alive"]`}
     * A player that has not died. Alive players have their ability, may vote as many times as they wish, and may nominate players. As long as 3 or more players are alive, the game continues.
     */
    get alive(): boolean {
        return !this.dead;
    }

    /**
     * {@link `glossary["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    get dead(): boolean {
        return this.hasNegativeState(State.Dead);
    }

    get mad(): boolean {
        return this.hasNegativeState(State.Mad);
    }

    get sane(): boolean {
        return !this.mad;
    }

    /**
     * {@link `glossary["State"]`}
     * A current property of a player. A player is always either drunk or sober, either poisoned or healthy, either alive or dead, and either mad or sane.
     */
    @Expose({ toPlainOnly: true })
    protected get state(): number {
        return (
            (this.dead ? State.Dead : 0) +
            (this.drunk ? State.Drunk : 0) +
            +(this.poisoned ? State.Poisoned : 0) +
            +(this.mad ? State.Mad : 0)
        );
    }

    protected negativeStateCauses: LazyMap<NegativeState, Set<unknown>> =
        new LazyMap((_state) => new Set());

    setNegativeState(
        negativeState: NegativeState,
        active: boolean,
        cause: unknown
    ) {
        if (active) {
            this.addNegativeState(negativeState, cause);
        } else {
            this.removeNegativeState(negativeState, cause);
        }
    }

    hasNegativeState(negativeState: NegativeState): boolean {
        return this.negativeStateCauses.get(negativeState).size > 0;
    }

    valueOf() {
        return this.state;
    }

    toJSON() {
        return instanceToPlain(this);
    }

    equals(other: PlayerState): boolean {
        return this.state === other.state;
    }

    toString() {
        const stateNames = Array.from(
            Generator.map(
                (negativeState) =>
                    this.hasNegativeState(negativeState)
                        ? PlayerState.getStateName(negativeState)
                        : PlayerState.getOppositeStateName(negativeState),
                PlayerState.NEGATIVE_STATES
            )
        );

        return stateNames.join(', ');
    }

    protected addNegativeState(negativeState: NegativeState, cause: unknown) {
        this.negativeStateCauses.get(negativeState).add(cause);
    }

    protected removeNegativeState(
        negativeState: NegativeState,
        cause: unknown
    ) {
        this.negativeStateCauses.get(negativeState).delete(cause);
    }
}
