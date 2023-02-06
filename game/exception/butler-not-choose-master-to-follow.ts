import type { AbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import type { ButlerPlayer } from '../types';
import { RecoverableGameError } from './exception';

export class ButlerNotChooseMasterToFollow extends RecoverableGameError {
    static description = 'The butler has not chosen master to follow on vote';

    declare correctedMaster: IPlayer;

    constructor(
        readonly butlerPlayer: ButlerPlayer,
        readonly context: AbilityUseContext
    ) {
        super(ButlerNotChooseMasterToFollow.description);
    }
}
