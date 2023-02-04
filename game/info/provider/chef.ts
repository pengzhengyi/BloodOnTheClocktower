import {
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
} from '../information';
import { type InfoProvideContext, InformationProvider } from './provider';
import { Generator, type LazyMap } from '~/game/collections';
import { Players } from '~/game/players';
import { Seating } from '~/game/seating/seating';

export interface ChefInformation {
    numPairEvilPlayers: number;
}

export class ChefInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends InformationProvider<TInfoProvideContext, ChefInformation> {
    protected static readonly cachedKeyForNumPairEvilPlayers =
        'actualNumPairEvilPlayers';

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<ChefInformation>> {
        const numPairEvilPlayers = await this.getNumPairEvilPlayers(
            context,
            false
        );

        return Generator.once([
            Information.true({
                numPairEvilPlayers,
            }),
        ]);
    }

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<ChefInformation>> {
        const numPlayers = context.players.length;

        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (numPairEvilPlayers) =>
                        Information.false({ numPairEvilPlayers }),
                    Generator.range(0, numPlayers + 1)
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if the number of pairs of evil players is correct, otherwise, the negative of the difference between actual and provided information is used as score. For example, suppose there are 3 pairs, both 1 and 5 reported in information will get -2 as the goodness score.
     */
    async evaluateGoodness(
        information: ChefInformation,
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        evaluationContext = await this.buildEvaluationContext(
            context,
            evaluationContext
        );
        const actualNumPairEvilPlayers = evaluationContext.getOrDefault(
            ChefInformationProvider.cachedKeyForNumPairEvilPlayers,
            0
        );

        if (information.numPairEvilPlayers === actualNumPairEvilPlayers) {
            return 1;
        } else {
            return -Math.abs(
                information.numPairEvilPlayers - actualNumPairEvilPlayers
            );
        }
    }

    protected async buildEvaluationContextImpl(
        context: TInfoProvideContext,
        evaluationContext: LazyMap<string, any>
    ) {
        if (
            !evaluationContext.has(
                ChefInformationProvider.cachedKeyForNumPairEvilPlayers
            )
        ) {
            const actualNumPairEvilPlayers = await this.getNumPairEvilPlayers(
                context,
                false
            );

            evaluationContext.set(
                ChefInformationProvider.cachedKeyForNumPairEvilPlayers,
                actualNumPairEvilPlayers
            );
        }

        return evaluationContext;
    }

    protected async getNumPairEvilPlayers(
        context: TInfoProvideContext,
        shouldFromRequestedPlayerPerspective: boolean
    ): Promise<number> {
        let numPairEvilPlayers = 0;

        for await (const _players of Seating.getNeighborPairs(
            context.seating
        )) {
            const players = shouldFromRequestedPlayerPerspective
                ? _players.map((player) => player.from(context.requestedPlayer))
                : _players;

            if (await Players.allEvil(players)) {
                numPairEvilPlayers++;
            }
        }

        return numPairEvilPlayers;
    }
}
