import { Character } from './character';
import { MinionPlayer, DemonPlayer } from './player';

/**
 * {@link `glossory["Demon Info"]`}
 * Shorthand on the night sheet, representing the information that the Demon receives on the first night if there are 7 or more players. The Demon learns which players are the Minions, and learns 3 good characters that are not in play to help them bluff.
 */
export interface DemonInfo {
    minions: Array<MinionPlayer>;
    notInPlayGoodCharacters: [Character, Character, Character];
}

/**
 * {@link `glossory["Minion info"]`}
 * Shorthand on the night sheet, representing the information that the Minions receive on the first night if there are 7 or more players. The Minions learn which other players are Minions, and which player the Demon is.
 */
export interface MinionInfo {
    minions: Array<MinionPlayer>;
    demon: Array<DemonPlayer>;
}
