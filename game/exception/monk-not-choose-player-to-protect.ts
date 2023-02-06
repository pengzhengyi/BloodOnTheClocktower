import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import type { MonkPlayer } from '../types';
import { RecoverableGameError } from './exception';

export class MonkNotChoosePlayerToProtect extends RecoverableGameError {
    static description = 'The monk has not chosen player to protect';

    declare correctedPlayerToProtect: IPlayer;

    constructor(
        readonly monkPlayer: MonkPlayer,
        readonly context: AbilityUseContext
    ) {
        super(MonkNotChoosePlayerToProtect.description);
    }
}
