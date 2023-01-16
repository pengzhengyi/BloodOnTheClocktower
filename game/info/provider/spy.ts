import {
    StoryTellerInformationOptions,
    StoryTellerInformation,
} from '../storytellerinformation';
import {
    InfoProvideContext,
    InfoProvider,
    IStoryTellerInformationProvider,
} from './provider';
import { Generator } from '~/game/collections';
import type { Grimoire } from '~/game/grimoire';

export interface SpyInformation {
    grimoire: Grimoire;
}

export class SpyInformationProvider<
        TInfoProvideContext extends InfoProvideContext
    >
    extends InfoProvider<SpyInformation>
    implements
        IStoryTellerInformationProvider<TInfoProvideContext, SpyInformation>
{
    async getStoryTellerInformationOptions(
        context: TInfoProvideContext
    ): Promise<StoryTellerInformationOptions<SpyInformation>> {
        const grimoire = await context.storyteller.getGrimoire(
            context.requestedPlayer
        );

        const info = new StoryTellerInformation({ grimoire });
        return Generator.once([info]);
    }
}
