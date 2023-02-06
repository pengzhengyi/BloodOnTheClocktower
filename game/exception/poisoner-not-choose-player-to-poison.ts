import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import type { PoisonerPlayer } from '../types';
import { RecoverableGameError } from './exception';

export class PoisonerNotChoosePlayerToPoison extends RecoverableGameError {
    static description = 'The poisoner has not chosen player to poison';

    declare correctedPlayerToPoison: IPlayer;

    constructor(
        readonly poisonerPlayer: PoisonerPlayer,
        readonly context: AbilityUseContext
    ) {
        super(PoisonerNotChoosePlayerToPoison.description);
    }
}
