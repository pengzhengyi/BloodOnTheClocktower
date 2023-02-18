import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class RavenkeeperNotChoosePlayerToProtect extends RecoverableGameError {
    static description =
        'The ravenkeeper has not chosen player to learn the character';

    declare correctedPlayer: IPlayer;

    constructor(
        readonly RavenkeeperPlayer: IPlayer,
        readonly context: AbilityUseContext
    ) {
        super(RavenkeeperNotChoosePlayerToProtect.description);
    }
}
