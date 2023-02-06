import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import type { ImpPlayer } from '../types';
import { RecoverableGameError } from './exception';

export class ImpNotChoosePlayerToKill extends RecoverableGameError {
    static description = 'The imp has not chosen player to poison';

    declare correctedPlayerToKill: IPlayer;

    constructor(
        readonly impPlayer: ImpPlayer,
        readonly context: AbilityUseContext
    ) {
        super(ImpNotChoosePlayerToKill.description);
    }
}
