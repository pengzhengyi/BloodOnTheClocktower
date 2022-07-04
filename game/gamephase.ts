import { Action } from './types';

enum Phase {
    /**
     * {@link `glossory["Night"]`}
     * The game phase in which players close their eyes, and certain characters wake to act or receive information. The game begins with the night phase. Each day is followed by a night. Each night is followed by a day.
     */
    Night = 0,
    /**
     * {@link `glossory["Dawn"]`}
     * The end of a night, just before the next day begins. Characters that act “at dawn” act after almost all other characters.
     */
    Dawn,

    /**
     * {@link `glossory["Day"]`}
     * The game phase in which players have their eyes open, talk with each other, and vote for an execution. Each day is followed by a night. Each night is followed by a day.
     */
    Day,
    /**
     * {@link `glossory["Dusk"]`}
     * The start of a night, just after the players close their eyes. Characters that act “at dusk” act before almost all other characters. Abilities that last “until dusk” end as soon as the players go to sleep.
     */
    Dusk,

    __LENGTH__,
}

export class GamePhase {
    phase: Phase = Phase.Night;
    cycleIndex: number = 0;
    readonly phaseToActions: Map<Phase, Array<Action>> = new Map();

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
}
