import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain } from 'class-transformer';
import { GAME_UI } from '~/interaction/gameui';

export enum Phase {
    /** before beginning a game */
    Setup = 1,

    /**
     * {@link `glossary["Night"]`}
     * The game phase in which players close their eyes, and certain characters wake to act or receive information. The game begins with the night phase. Each day is followed by a night. Each night is followed by a day.
     */
    Night = 1 << 1,
    /**
     * {@link `glossary["Dawn"]`}
     * The end of a night, just before the next day begins. Characters that act “at dawn” act after almost all other characters.
     */
    Dawn = 1 << 2,

    /**
     * {@link `glossary["Day"]`}
     * The game phase in which players have their eyes open, talk with each other, and vote for an execution. Each day is followed by a night. Each night is followed by a day.
     */
    Day = 1 << 3,
    /**
     * {@link `glossary["Dusk"]`}
     * The start of a night, just after the players close their eyes. Characters that act “at dusk” act before almost all other characters. Abilities that last “until dusk” end as soon as the players go to sleep.
     */
    Dusk = 1 << 4,

    /** Night, Dawn, Day, Dusk */
    __ALL__ = 0b11110,

    /** The end of the game */
    GameEnd = 1 << 5,
}

function getPhaseIndex(phase: Phase): number {
    let index = 0;
    let bit = 1;

    while ((bit & phase) === 0) {
        bit <<= 1;
        index++;
    }

    return index;
}

function getPhase(phaseCounter: number): Phase {
    if (phaseCounter < 5) {
        return 1 << phaseCounter;
    } else {
        return 1 << phaseCounter % 4;
    }
}

export function includePhase(phases: number, phase: Phase) {
    return (phases & phase) === phase;
}

@Exclude()
export class GamePhase {
    protected _phase: Phase;

    /**
     * The index of current phase. Initial setup phase will has index 0 while first night has index 1.
     */
    @Expose({ toPlainOnly: true })
    protected phaseCounter: number;

    /**
     * The date index of current phase. Initial setup phase and first night is at date 0, while first day is at date 1, and each subsequent day the following date.
     */
    get dateIndex(): number {
        return Math.floor((this.phaseCounter + 2) / 4);
    }

    get phase(): Phase {
        return this._phase;
    }

    get cycleIndex(): number {
        return Math.floor((this.phaseCounter - 1) / 4);
    }

    /**
     * {@link `glossary["First night"]`}
     * The night phase that begins the game. Some characters act only during the first night. Some characters act during each night except the first. Players may talk about their characters only after the first night.
     */
    get isFirstNight(): boolean {
        return this._phase === Phase.Night && this.cycleIndex === 0;
    }

    get isNonfirstNight(): boolean {
        return this._phase === Phase.Night && this.cycleIndex !== 0;
    }

    get isDay(): boolean {
        return this._phase === Phase.Day;
    }

    get isNight(): boolean {
        return this._phase === Phase.Night;
    }

    static format(phase: Phase, cycleIndex: number): string {
        return `${Phase[phase]} ${cycleIndex}`;
    }

    static setup() {
        return this.of(0);
    }

    static firstNight() {
        return this.of(1);
    }

    static of(phaseCounter: number): GamePhase {
        return new this(undefined, phaseCounter);
    }

    protected constructor(phase?: Phase, phaseCounter?: number) {
        if (phase === undefined && phaseCounter === undefined) {
            phase = Phase.Setup;
        }

        if (phase === undefined) {
            this._phase = getPhase(phaseCounter!);
        } else {
            this._phase = phase;
        }

        if (phaseCounter === undefined) {
            this.phaseCounter = getPhaseIndex(phase!);
        } else {
            this.phaseCounter = phaseCounter;
        }
    }

    async forceTransition(reason?: string): Promise<boolean> {
        reason = reason ? ` because ${reason}` : '';

        if (
            await GAME_UI.storytellerConfirm(
                `Should transition from ${this} to next phase${reason}`
            )
        ) {
            this.transition();
            return true;
        }

        return false;
    }

    toJSON() {
        return instanceToPlain(this);
    }

    toString() {
        return GamePhase.format(this._phase, this.cycleIndex);
    }

    valueOf() {
        return this.phaseCounter;
    }

    isBefore(other: GamePhase): boolean {
        return this.phaseCounter < other.phaseCounter;
    }

    equals(other: GamePhase): boolean {
        return this.phaseCounter === other.phaseCounter;
    }

    isAfter(other: GamePhase): boolean {
        return this.phaseCounter > other.phaseCounter;
    }

    protected transition() {
        let phase = this._phase << 1;
        this.phaseCounter++;
        if (phase > Phase.Dusk) {
            phase = Phase.Night;
        }

        this._phase = phase;
    }
}