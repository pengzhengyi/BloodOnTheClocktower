import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain } from 'class-transformer';
import { Action } from './types';

enum Phase {
    /**
     * {@link `glossary["Night"]`}
     * The game phase in which players close their eyes, and certain characters wake to act or receive information. The game begins with the night phase. Each day is followed by a night. Each night is followed by a day.
     */
    Night = 0,
    /**
     * {@link `glossary["Dawn"]`}
     * The end of a night, just before the next day begins. Characters that act “at dawn” act after almost all other characters.
     */
    Dawn,

    /**
     * {@link `glossary["Day"]`}
     * The game phase in which players have their eyes open, talk with each other, and vote for an execution. Each day is followed by a night. Each night is followed by a day.
     */
    Day,
    /**
     * {@link `glossary["Dusk"]`}
     * The start of a night, just after the players close their eyes. Characters that act “at dusk” act before almost all other characters. Abilities that last “until dusk” end as soon as the players go to sleep.
     */
    Dusk,

    __LENGTH__,
}

@Exclude()
export class GamePhase {
    @Expose({ toPlainOnly: true })
    phase: Phase = Phase.Night;

    @Expose({ toPlainOnly: true })
    cycleIndex = 0;

    readonly phaseToActions: Map<Phase, Array<Action>> = new Map();

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

    transition() {
        let phase = this.phase++;
        if (phase === Phase.__LENGTH__) {
            this.cycleIndex++;
            phase = Phase.Night;
        }

        this.phase = phase;
    }

    cycle() {
        while (true) {
            const actions = this.phaseToActions.get(this.phase);
            actions?.forEach((action) => action());
            this.transition();
        }
    }

    toJSON() {
        return instanceToPlain(this);
    }
}
