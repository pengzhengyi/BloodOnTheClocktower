import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player/player';
import { RecoverableGameError } from './exception';

export class SlayerNotChoosePlayerToKill extends RecoverableGameError {
    static description = 'The slayer has not chosen player to kill';

    declare correctedPlayerToKill: IPlayer;

    constructor(
        readonly slayerPlayer: IPlayer,
        readonly context: AbilityUseContext
    ) {
        super(SlayerNotChoosePlayerToKill.description);
    }
}
