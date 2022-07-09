import { Character } from '../character';
import { Townsfolk } from '../charactertype';
import { Info } from '../info';
import { Player } from '../player';

export class Washerwoman extends Character {
    static characterType = Townsfolk;
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
