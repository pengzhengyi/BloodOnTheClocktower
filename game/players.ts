import { Generator } from './collections';
import { Player } from './player';

export class Players extends Generator<Player> {
    isMinion() {
        return this.filter((player) => player.character.isMinion);
    }

    isDemon() {
        return this.filter((player) => player.character.isDemon);
    }

    isTownsfolk() {
        return this.filter((player) => player.character.isTownsfolk);
    }

    isOutsider() {
        return this.filter((player) => player.character.isOutsider);
    }

    isFabled() {
        return this.filter((player) => player.character.isFabled);
    }
}
