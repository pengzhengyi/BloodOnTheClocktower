export enum Phase {
    /** before beginning a game */
    Setup = 0b1,

    /**
     * {@link `glossary["Night"]`}
     * The game phase in which players close their eyes, and certain characters wake to act or receive information. The game begins with the night phase. Each day is followed by a night. Each night is followed by a day.
     */
    Night = 0b10,
    /**
     * {@link `glossary["Dawn"]`}
     * The end of a night, just before the next day begins. Characters that act “at dawn” act after almost all other characters.
     */
    Dawn = 0b100,

    /**
     * {@link `glossary["Day"]`}
     * The game phase in which players have their eyes open, talk with each other, and vote for an execution. Each day is followed by a night. Each night is followed by a day.
     */
    Day = 0b1000,
    /**
     * {@link `glossary["Dusk"]`}
     * The start of a night, just after the players close their eyes. Characters that act “at dusk” act before almost all other characters. Abilities that last “until dusk” end as soon as the players go to sleep.
     */
    Dusk = 0b10000,

    /** Night, Dawn, Day, Dusk */
    __ALL__ = 0b11110,

    /** The end of the game */
    GameEnd = 0b100000,
}

export function getPhaseIndex(phase: Phase): number {
    let index = 0;
    let bit = 1;

    while ((bit & phase) === 0) {
        bit <<= 1;
        index++;
    }

    return index;
}

export function getPhase(phaseCounter: number): Phase {
    if (phaseCounter < 5) {
        return 1 << phaseCounter;
    } else {
        return 1 << phaseCounter % 4;
    }
}

export function includePhase(phases: number, phase: Phase) {
    return (phases & phase) === phase;
}

export function toString(phase: Phase): string {
    return Phase[phase];
}

export function isPhase(phase: unknown): phase is Phase {
    return Number.isInteger(phase) && (phase as number) in Phase;
}
