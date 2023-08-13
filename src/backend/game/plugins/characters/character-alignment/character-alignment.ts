/**
 * Character alignment is the default alignment of a character type.
 *
 * For example, the default alignment of a townsfolk character is good.
 *
 * ! Note: character alignment is not the same as player alignment. A player's alignment can change during the game. A character's alignment is more like the default alignment of a character type.
 */
export enum CharacterAlignment {
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

    /** Travellers are unknown because storytellers choose their alignment */
    Unknown = 'unknown',
}
