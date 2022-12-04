import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain } from 'class-transformer';
import { Action } from './types';
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
}

export function includePhase(phases: number, phase: Phase) {
    return (phases & phase) === phase;
}

@Exclude()
export class GamePhase {
    readonly phaseToActions: Map<Phase, Array<Action>> = new Map();

    @Expose({ toPlainOnly: true })
    protected phase: Phase;

    @Expose({ toPlainOnly: true })
    protected cycleIndex;

    /**
     * {@link `glossary["First night"]`}
     * The night phase that begins the game. Some characters act only during the first night. Some characters act during each night except the first. Players may talk about their characters only after the first night.
     */
    get isFirstNight(): boolean {
        return this.phase === Phase.Night && this.cycleIndex === 0;
    }

    get isNonfirstNight(): boolean {
        return this.phase === Phase.Night && this.cycleIndex !== 0;
    }

    get isDay(): boolean {
        return this.phase === Phase.Day;
    }

    get isNight(): boolean {
        return this.phase === Phase.Night;
    }

    static format(phase: Phase, cycleIndex: number): string {
        return `${Phase[phase]} ${cycleIndex}`;
    }

    static setup() {
        return new this(Phase.Setup);
    }

    constructor(phase: Phase = Phase.Night, cycleIndex = 0) {
        this.phase = phase;
        this.cycleIndex = cycleIndex;
    }

    cycle() {
        while (true) {
            const actions = this.phaseToActions.get(this.phase);
            actions?.forEach((action) => action());
            this.transition();
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
        return GamePhase.format(this.phase, this.cycleIndex);
    }

    protected transition() {
        let phase = this.phase << 1;
        if (phase > Phase.Dusk) {
            this.cycleIndex++;
            phase = Phase.Night;
        }

        this.phase = phase;
    }
}
