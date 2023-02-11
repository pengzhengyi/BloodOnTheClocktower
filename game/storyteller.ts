import { NoDefinedInfoProvider } from './exception/no-defined-info-provider';
import { type IGrimoire } from './grimoire';
import type { Info, InfoOptions } from './info/info';
import type {
    InfoRequestContext,
    InformationRequestContext,
} from './info/requester/requester';
import type { IPlayer } from './player';
import { type AsyncTask } from './types';
import { GameEnvironment } from './environment';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface IStoryTeller {
    /**
     * Request a grimoire from the storyteller.
     *
     * @param requestedPlayer The player to request grimoire. If unspecified, consider it as the storyteller who is requesting grimoire.
     * @returns The grimoire, might (not) be the actual grimoire depending on requester.
     */
    getGrimoire(requestedPlayer?: IPlayer): Promise<IGrimoire>;

    /**
     * Request information from storyteller.
     *
     * @param context The context for this information request.
     * @returns The requested information.
     */
    giveInfo<TInformation, InfoType extends Info<TInformation>>(
        context: InfoRequestContext<TInformation>
    ): Promise<InfoType>;
}

/**
 * {@link `glossary["Storyteller"]`}
 * The person who runs the game. The Storyteller keeps the Grimoire, follows the rules of the game, and makes the final decision on what happens when a situation needs adjudication.
 */
export class StoryTeller implements IStoryTeller {
    static DEFAULT_WAKE_REASON =
        'Player is awaken to act or receive information';

    protected grimoire?: IGrimoire;

    getGrimoire(_requestedPlayer?: IPlayer): Promise<IGrimoire> {
        // await new BlankGrimoire(this).throwWhen(
        //     (error) => error.storyteller.grimoire === undefined
        // );

        // TODO mdoify this to get grimoire based on player
        return Promise.resolve(this.grimoire!);
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

    constructor(grimoire: IGrimoire) {
        this.grimoire = grimoire;
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

    async giveInfo<TInformation, TInfoType extends Info<TInformation>>(
        context: InfoRequestContext<TInformation>
    ): Promise<TInfoType> {
        return await NoDefinedInfoProvider.catch<
            NoDefinedInfoProvider,
            TInfoType
        >(
            () => this.tryGiveInfo(context),
            (error) => this.giveInfoManually(context, error)
        );
    }

    protected async tryGiveInfo<
        TInformation,
        TInfoType extends Info<TInformation>
    >(context: InfoRequestContext<TInformation>): Promise<TInfoType> {
        const provideInfo =
            GameEnvironment.current.infoProviderLoader.loadMethod<TInformation>(
                context.requester.infoType,
                context.isStoryTellerInformation,
                (context as InformationRequestContext<TInformation>)
                    .willGetTrueInformation
            );
        const infoOptions = await provideInfo(context);
        return this.chooseInfoToGive(infoOptions);
    }

    protected async giveInfoManually<
        TInformation,
        TInfoType extends Info<TInformation>
    >(
        _context: InfoRequestContext<TInformation>,
        error: NoDefinedInfoProvider
    ): Promise<TInfoType> {
        // TODO properly get info from storyteller
        const info =
            await InteractionEnvironment.current.gameUI.storytellerDecide<TInfoType>(
                error.toString(),
                false
            );
        return info!;
    }

    protected async chooseInfoToGive<
        TInformation,
        TInfoType extends Info<TInformation>
    >(
        infoOptions: InfoOptions<TInformation>,
        reason?: string
    ): Promise<TInfoType> {
        const info =
            (await InteractionEnvironment.current.gameUI.storytellerChooseOne(
                infoOptions,
                reason
            )) as TInfoType;
        return info;
    }
}
