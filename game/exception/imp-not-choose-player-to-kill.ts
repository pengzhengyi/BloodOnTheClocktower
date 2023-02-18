import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class ImpNotChoosePlayerToKill extends RecoverableGameError {
    static description = 'The imp has not chosen player to poison';

    declare correctedPlayerToKill: IPlayer;

    constructor(
        readonly impPlayer: IPlayer,
        readonly context: AbilityUseContext
    ) {
        super(ImpNotChoosePlayerToKill.description);
    }
}
