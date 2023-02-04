import { BlankGrimoire, NoDefinedInfoProvider } from './exception';
import { type IGrimoire, Grimoire } from './grimoire';
import type { Info } from './info/info';
import type {
    InfoRequestContext,
    InformationRequestContext,
} from './info/requester/requester';
import { InfoProviderLoader } from './info/provider/loader';
import type { IPlayer } from './player';
import type { IPlayers } from './players';
import { type AsyncTask } from './types';
import { InteractionEnvironment } from '~/interaction/environment';

/**
 * {@link `glossary["Storyteller"]`}
 * The person who runs the game. The Storyteller keeps the Grimoire, follows the rules of the game, and makes the final decision on what happens when a situation needs adjudication.
 */
export class StoryTeller {
    static DEFAULT_WAKE_REASON =
        'Player is awaken to act or receive information';

    protected grimoire?: IGrimoire;

    protected infoProviderLoader: InfoProviderLoader = new InfoProviderLoader();

    async getGrimoire(_requestedPlayer?: IPlayer): Promise<IGrimoire> {
        await new BlankGrimoire(this).throwWhen(
            (error) => error.storyteller.grimoire === undefined
        );

        // TODO
        return this.grimoire!;
    }

    async interact(
        player: IPlayer,
        action: AsyncTask<IPlayer>,
        reason?: string
    ) {
        if (reason === undefined) {
            reason = action.toString();
        }

        await action(player);
    }

    initializeGrimoire(players: IPlayers) {
        this.grimoire = new Grimoire(players);
    }

    /**
     * {@link `glossary["Wake"]`}
     * A player opening their eyes at night. The Storyteller wakes a player by tapping twice on the knee or shoulder, and wakes all players by saying “eyes open, everybody” at dawn.
     */
    async wake(
        player: IPlayer,
        action: AsyncTask<IPlayer>,
        reason: string = StoryTeller.DEFAULT_WAKE_REASON
    ) {
        await this.interact(player, action, reason);
    }

    async giveInfo<TInformation, InfoType extends Info<TInformation>>(
        context: InfoRequestContext<TInformation>
    ): Promise<InfoType> {
        const provideInfo = this.infoProviderLoader.loadProvide(
            context.requester,
            context.isStoryTellerInformation,
            (context as InformationRequestContext<TInformation>)
                .willGetTrueInformation
        );

        if (provideInfo === undefined) {
            const error = new NoDefinedInfoProvider<InfoType, TInformation>(
                context,
                this.infoProviderLoader
            );
            await error.throwWhen((error) => error.correctedInfo === undefined);
            return error.correctedInfo!;
        } else {
            const infoOptions = await provideInfo(context);
            const info =
                (await InteractionEnvironment.current.gameUI.storytellerChooseOne(
                    infoOptions,
                    context.reason
                )) as InfoType;
            return info;
        }
    }
}
