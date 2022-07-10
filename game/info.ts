import { Character } from './character';
import { Townsfolk } from './charactertype';
import { MinionPlayer, DemonPlayer, Player } from './player';
import { Washerwoman } from '~/content/characters/output/washerwoman';

/**
 * {@link `glossary["Demon Info"]`}
 * Shorthand on the night sheet, representing the information that the Demon receives on the first night if there are 7 or more players. The Demon learns which players are the Minions, and learns 3 good characters that are not in play to help them bluff.
 */
export interface DemonInfo {
    minions: Array<MinionPlayer>;
    notInPlayGoodCharacters: [Character, Character, Character];
}

/**
 * {@link `glossary["Minion info"]`}
 * Shorthand on the night sheet, representing the information that the Minions receive on the first night if there are 7 or more players. The Minions learn which other players are Minions, and which player the Demon is.
 */
export interface MinionInfo {
    minions: Array<MinionPlayer>;
    demon: Array<DemonPlayer>;
}

export abstract class Info {
    constructor(readonly receiver: Player, readonly isTrue: boolean) {
        this.receiver = receiver;
        this.isTrue = isTrue;
    }
}

export class WasherwomanInfo extends Info {
    constructor(
        readonly receiver: Player & { character: typeof Washerwoman },
        readonly isTrue: boolean,
        readonly players: [
            Player & { characterType: typeof Townsfolk },
            Player
        ],
        readonly character: typeof Character & {
            characterType: typeof Townsfolk;
        }
    ) {
        super(receiver, isTrue);
        this.players = players;
        this.character = character;
    }
}
