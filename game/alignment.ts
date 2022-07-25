/**
 * {@link `glossary["Alignment"]`}
 * The team that a player is currently on. Alignment is either good or evil. If a player changes alignment, their character stays the same. If a player changes character, their alignment stays the same. Players know their own alignment.
 */
export enum Alignment {
    /**
     * {@link `glossary["Good"]`}
     * The good alignment. Townsfolk and Outsiders (blue characters) start as good. Good wins if the Demon dies.
     */
    Good = 'good',
    /**
     * {@link `glossary["Evil"]`}
     * The evil alignment. Minions and Demons (red characters) start as evil. Evil wins when just 2 players are alive, not including Travellers.
     */
    Evil = 'evil',
    /** Fabled characters are neutral */
    Neutral = 'neutral',
}
