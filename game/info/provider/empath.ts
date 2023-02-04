import {
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
    type FalseInformation,
} from '../information';
import { type InfoProvideContext, InformationProvider } from './provider';
import { Generator, type LazyMap } from '~/game/collections';
import type { IPlayer } from '~/game/player';
import { Seating } from '~/game/seating/seating';

/**
 * {@link `empath["ability"]`}
 * "Each night, you learn how many of your 2 alive neighbours are evil."
 */
export interface EmpathInformation {
    numEvilAliveNeighbors: 0 | 1 | 2;
}

export class EmpathInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends InformationProvider<TInfoProvideContext, EmpathInformation> {
    protected static readonly cachedKeyForNumEvilAliveNeighbors =
        'actualNumEvilAliveNeighbors';

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<EmpathInformation>> {
        const numEvilAliveNeighbors = await this.getNumEvilAliveNeighbors(
            context,
            true
        );

        return Generator.once([
            Information.true({
                numEvilAliveNeighbors,
            } as EmpathInformation),
        ]);
    }

    getFalseInformationOptions(
        _context: TInfoProvideContext
    ): Promise<FalseInformationOptions<EmpathInformation>> {
        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (numEvilAliveNeighbors) =>
                        Information.false({
                            numEvilAliveNeighbors,
                        }) as FalseInformation<EmpathInformation>,
                    Generator.range(0, 3)
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if the number of evil alive neighbors is correct, otherwise, the negative of the difference between actual and provided information is used as score. For example, suppose there are 2 evil alive neighbors, 0 reported in information will get -2 as the goodness score.
     */
    async evaluateGoodness(
        information: EmpathInformation,
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        evaluationContext = await this.buildEvaluationContext(
            context,
            evaluationContext
        );
        const actualNumEvilAliveNeighbors = evaluationContext.getOrDefault(
            EmpathInformationProvider.cachedKeyForNumEvilAliveNeighbors,
            0
        );

        if (information.numEvilAliveNeighbors === actualNumEvilAliveNeighbors) {
            return 1;
        } else {
            return -Math.abs(
                information.numEvilAliveNeighbors - actualNumEvilAliveNeighbors
            );
        }
    }

    protected async buildEvaluationContextImpl(
        context: TInfoProvideContext,
        evaluationContext: LazyMap<string, any>
    ) {
        if (
            !evaluationContext.has(
                EmpathInformationProvider.cachedKeyForNumEvilAliveNeighbors
            )
        ) {
            const actualNumEvilAliveNeighbors =
                await this.getNumEvilAliveNeighbors(context, false);

            evaluationContext.set(
                EmpathInformationProvider.cachedKeyForNumEvilAliveNeighbors,
                actualNumEvilAliveNeighbors
            );
        }

        return evaluationContext;
    }

    protected async getNumEvilAliveNeighbors(
        context: TInfoProvideContext,
        shouldFromRequestedPlayerPerspective: boolean
    ): Promise<number> {
        const aliveNeighbors = await Seating.getAliveNeighbors(
            context.seating,
            context.requestedPlayer,
            async (seatPlayer) => {
                const player = shouldFromRequestedPlayerPerspective
                    ? seatPlayer?.from(context.requestedPlayer)
                    : seatPlayer;

                if (player === undefined) {
                    return false;
                } else {
                    return await player.alive;
                }
            }
        );

        const areNeighborsEvil = await Promise.all(
            aliveNeighbors.map((aliveNeighbor) =>
                this.isEvilAliveNeighbor(
                    aliveNeighbor,
                    context.requestedPlayer,
                    shouldFromRequestedPlayerPerspective
                )
            )
        );

        return areNeighborsEvil.reduce(
            (accumulator, isEvil) => accumulator + (isEvil ? 1 : 0),
            0
        );
    }

    protected async isEvilAliveNeighbor(
        aliveNeighbor: IPlayer,
        empathPlayer: IPlayer,
        shouldFromRequestedPlayerPerspective: boolean
    ): Promise<boolean> {
        const player = shouldFromRequestedPlayerPerspective
            ? aliveNeighbor.from(empathPlayer)
            : aliveNeighbor;

        return await player.isEvil;
    }
}
