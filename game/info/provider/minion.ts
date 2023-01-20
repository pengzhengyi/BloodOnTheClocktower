import {
    TrueInformationOptions,
    Information,
    FalseInformationOptions,
} from '../information';
import { DemonMinionInformationProvider } from './common';
import { InfoProvideContext } from './provider';
import { Generator } from '~/game/collections';
import type { DemonPlayer, MinionPlayer } from '~/game/types';

/**
 * {@link `glossary["Minion info"]`}
 * Shorthand on the night sheet, representing the information that the Minions receive on the first night if there are 7 or more players. The Minions learn which other players are Minions, and which player the Demon is.
 */
export interface MinionInformation {
    otherMinions: Array<MinionPlayer>;
    demon: DemonPlayer;
}

export class MinionInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends DemonMinionInformationProvider<
    TInfoProvideContext,
    MinionInformation
> {
    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<MinionInformation>> {
        const otherMinions = await this.getMinionPlayers(context);

        const demon = await this.getDemonPlayer(context);

        return Generator.once([
            Information.true({
                otherMinions,
                demon,
            }),
        ]);
    }

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<MinionInformation>> {
        const hypotheticalCombinationsForMinionPlayers =
            this.getHypotheticalCombinationsForMinionPlayers(context);

        const hypotheticalCandidatesForDemon = context.players.isNot(
            context.requestedPlayer
        );

        const infoOptions = Generator.once(
            Generator.cartesian_product(
                hypotheticalCombinationsForMinionPlayers,
                hypotheticalCandidatesForDemon
            )
        ).map(([otherMinions, demon]) =>
            Information.false({
                otherMinions,
                demon,
            })
        );

        return Promise.resolve(infoOptions);
    }

    /**
     * @override Goodness is evaluated on the following criterion: 5 for each player that is a minion, -5 if not; 5 for provided player is the demon.
     */
    async evaluateGoodness(
        information: MinionInformation,
        _context: TInfoProvideContext
    ): Promise<number> {
        let score = await this.evaluateGoodnessForMinions(
            information.otherMinions
        );
        score += (await information.demon.isDemon) ? 5 : -5;
        return score;
    }
}
