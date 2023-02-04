import {
    type StoryTellerInformationOptions,
    StoryTellerInformation,
} from '../storyteller-information';
import {
    type FalseInformationOptions,
    Information,
    type TrueInformationOptions,
} from '../information';
import {
    type InfoProvideContext,
    InformationProvider,
    type IStoryTellerInformationProvider,
} from './provider';
import { Generator, type LazyMap } from '~/game/collections';
import type { IGrimoire } from '~/game/grimoire';
import type { SpyPlayer } from '~/game/types';
import type { StoryTeller } from '~/game/storyteller';

export interface SpyInformation {
    grimoire: IGrimoire;
}

export class SpyInformationProvider<
        TInfoProvideContext extends InfoProvideContext
    >
    extends InformationProvider<TInfoProvideContext, SpyInformation>
    implements
        IStoryTellerInformationProvider<TInfoProvideContext, SpyInformation>
{
    async getStoryTellerInformationOptions(
        context: TInfoProvideContext
    ): Promise<StoryTellerInformationOptions<SpyInformation>> {
        const grimoire = await this.getGrimoire(
            context.storyteller,
            context.requestedPlayer
        );

        const info = new StoryTellerInformation({ grimoire });
        return Generator.once([info]);
    }

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<SpyInformation>> {
        const grimoire = await this.getGrimoire(
            context.storyteller,
            context.requestedPlayer
        );

        return Generator.once([
            Information.true({
                grimoire,
            } as SpyInformation),
        ]);
    }

    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<SpyInformation>> {
        const grimoire = await this.getGrimoire(
            context.storyteller,
            context.requestedPlayer
        );

        return Generator.once([
            Information.false({
                grimoire,
            } as SpyInformation),
        ]);
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual grimoire is provided, -1 otherwise.
     */
    async evaluateGoodness(
        information: SpyInformation,
        context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        const trueGrimoire = await context.storyteller.getGrimoire();
        return Object.is(information.grimoire, trueGrimoire) ? 1 : -1;
    }

    protected async getGrimoire(
        storyteller: StoryTeller,
        spyPlayer: SpyPlayer
    ) {
        return await storyteller.getGrimoire(spyPlayer);
    }
}
