import { GAME_UI } from '../dependencies.config';
import { RavenkeeperNotChoosePlayerToProtect } from '../exception';
import type { RavenkeeperInformation } from '../info/provider/ravenkeeper';
import {
    RavenkeeperInformationRequester,
    RavenkeeperInformationRequestContext,
} from '../info/requester/ravenkeeper';
import type { Player } from '../player';
import type { RavenkeeperPlayer } from '../types';
import {
    GetCharacterInformationAbility,
    GetInfoAbilityUseContext,
} from './ability';

export class GetRavenkeeperInformationAbility extends GetCharacterInformationAbility<
    RavenkeeperInformation,
    RavenkeeperInformationRequester<
        RavenkeeperInformationRequestContext<RavenkeeperInformation>
    >
> {
    /**
     * {@link `ravenkeeper["ability"]`}
     */
    static readonly description =
        'If you die at night, you are woken to choose a player: you learn their character.';

    protected infoRequester = new RavenkeeperInformationRequester<
        RavenkeeperInformationRequestContext<RavenkeeperInformation>
    >();

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<RavenkeeperInformationRequestContext<RavenkeeperInformation>> {
        const infoRequestContext = (await super.createRequestContext(
            context
        )) as Omit<
            RavenkeeperInformationRequestContext<RavenkeeperInformation>,
            'chosenPlayer'
        >;
        const chosenPlayer = await this.choosePlayer(
            context.requestedPlayer,
            context.players,
            context
        );
        (
            infoRequestContext as RavenkeeperInformationRequestContext<RavenkeeperInformation>
        ).chosenPlayer = chosenPlayer;
        return infoRequestContext as RavenkeeperInformationRequestContext<RavenkeeperInformation>;
    }

    protected async choosePlayer(
        ravenkeeperPlayer: RavenkeeperPlayer,
        players: Iterable<Player>,
        context: GetInfoAbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            ravenkeeperPlayer,
            players,
            1,
            GetRavenkeeperInformationAbility.description
        )) as Player;

        if (chosen === undefined) {
            const error = new RavenkeeperNotChoosePlayerToProtect(
                ravenkeeperPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedPlayer;
        }

        return chosen;
    }
}
