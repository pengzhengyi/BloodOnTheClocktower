import { RavenkeeperNotChoosePlayerToProtect } from '../exception/ravenkeeper-not-choose-player-to-protect';
import type { RavenkeeperInformation } from '../info/provider/ravenkeeper';
import {
    RavenkeeperInformationRequester,
    type RavenkeeperInformationRequestContext,
} from '../info/requester/ravenkeeper';
import type { IPlayer, IPlayer as RavenkeeperPlayer } from '../player';
import {
    GetCharacterInformationAbility,
    type GetInfoAbilityUseContext,
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
        const chosenPlayer = await this.choosePlayerToLearn(
            context.requestedPlayer,
            context.players,
            context
        );
        (
            infoRequestContext as RavenkeeperInformationRequestContext<RavenkeeperInformation>
        ).chosenPlayer = chosenPlayer;
        return infoRequestContext as RavenkeeperInformationRequestContext<RavenkeeperInformation>;
    }

    protected async choosePlayerToLearn(
        ravenkeeperPlayer: RavenkeeperPlayer,
        players: Iterable<IPlayer>,
        context: GetInfoAbilityUseContext
    ): Promise<IPlayer> {
        let chosen = await this.chooseOnePlayer(
            ravenkeeperPlayer,
            players,
            GetRavenkeeperInformationAbility.description
        );

        chosen = await RavenkeeperNotChoosePlayerToProtect.ternary(
            () => chosen !== undefined,
            () => chosen,
            () =>
                new RavenkeeperNotChoosePlayerToProtect(
                    ravenkeeperPlayer,
                    context
                ),
            (error) => error.correctedPlayer
        );

        return chosen;
    }
}
