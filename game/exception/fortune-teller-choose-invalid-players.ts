import type { GetInfoAbilityUseContext } from '../ability/ability';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class FortuneTellerChooseInvalidPlayers extends RecoverableGameError {
    static description =
        'The fortune teller has not chosen two players to detect';

    declare corrected: [IPlayer, IPlayer];

    constructor(
        readonly fortuneTellerPlayer: IPlayer,
        readonly chosen: Array<IPlayer> | undefined,
        readonly context: GetInfoAbilityUseContext
    ) {
        super(FortuneTellerChooseInvalidPlayers.description);
    }
}
