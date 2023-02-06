import type { GetInfoAbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import type { UndertakerPlayer } from '../types';
import { RecoverableGameError } from './exception';

export class UndertakerRequestInfoWhenNoExecution extends RecoverableGameError {
    static description =
        'The undertaker cannot get information when there was no execution today';

    declare corrected: [IPlayer, IPlayer];

    constructor(
        readonly undertakerPlayer: UndertakerPlayer,
        readonly context: GetInfoAbilityUseContext
    ) {
        super(UndertakerRequestInfoWhenNoExecution.description);
    }
}
