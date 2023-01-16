import {
    TrueInformationOptions,
    Information,
    FalseInformationOptions,
    FalseInformation,
} from '../information';
import { InfoProvideContext, InformationProvider } from './provider';
import { Generator, LazyMap } from '~/game/collections';
import type { Player } from '~/game/player';

/**
 * {@link `fortuneteller["ability"]`}
 * "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you."
 */
export interface FortuneTellerInformation {
    chosenPlayers: [Player, Player];
    hasDemon: boolean;
}

export interface FortuneTellerInformationProviderContext
    extends InfoProvideContext {
    chosenPlayers: [Player, Player];
}

export class FortuneTellerInformationProvider<
    TInfoProvideContext extends FortuneTellerInformationProviderContext
> extends InformationProvider<TInfoProvideContext, FortuneTellerInformation> {
    protected static readonly cachedKeyForHasDemon = 'actualHasDemon';

    async getTrueInformationOptions(
        context: FortuneTellerInformationProviderContext
    ): Promise<TrueInformationOptions<FortuneTellerInformation>> {
        const hasDemon = await this.getHasDemonInChosenPlayers(context, true);

        return Generator.once([
            Information.true({
                chosenPlayers: context.chosenPlayers,
                hasDemon,
            } as FortuneTellerInformation),
        ]);
    }

    getFalseInformationOptions(
        context: FortuneTellerInformationProviderContext
    ): Promise<FalseInformationOptions<FortuneTellerInformation>> {
        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (hasDemon) =>
                        Information.false({
                            chosenPlayers: context.chosenPlayers,
                            hasDemon,
                        }) as FalseInformation<FortuneTellerInformation>,
                    [true, false]
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual and provided information match implying one of two chosen players is a demon , -1 otherwise.
     */
    async evaluateGoodness(
        information: FortuneTellerInformation,
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        evaluationContext = await this.buildEvaluationContext(
            context,
            evaluationContext
        );
        const actualHasDemon = evaluationContext.getOrDefault(
            FortuneTellerInformationProvider.cachedKeyForHasDemon,
            false
        );

        if (information.hasDemon === actualHasDemon) {
            return 1;
        } else {
            return -1;
        }
    }

    protected async buildEvaluationContextImpl(
        context: FortuneTellerInformationProviderContext,
        evaluationContext: LazyMap<string, any>
    ) {
        if (
            !evaluationContext.has(
                FortuneTellerInformationProvider.cachedKeyForHasDemon
            )
        ) {
            const actualHasDemon = await this.getHasDemonInChosenPlayers(
                context,
                false
            );

            evaluationContext.set(
                FortuneTellerInformationProvider.cachedKeyForHasDemon,
                actualHasDemon
            );
        }

        return evaluationContext;
    }

    protected async getHasDemonInChosenPlayers(
        context: FortuneTellerInformationProviderContext,
        shouldFromRequestedPlayerPerspective: boolean
    ): Promise<boolean> {
        const players = shouldFromRequestedPlayerPerspective
            ? context.chosenPlayers.map((player) =>
                  player.from(context.requestedPlayer)
              )
            : context.chosenPlayers;

        for await (const isDemon of Generator.promiseRaceAll(
            Generator.toPromise((player) => player.isDemon, players)
        )) {
            if (isDemon) {
                return true;
            }
        }

        return false;
    }
}
