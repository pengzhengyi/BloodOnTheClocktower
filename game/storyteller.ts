import { BlankGrimoire, NoDefinedInfoProvider } from './exception';
import { Grimoire } from './grimoire';
import type { Info } from './info/info';
import type {
    InfoRequestContext,
    InformationRequestContext,
} from './info/requester/requester';
import { InfoProviderLoader } from './info/provider/loader';
import { Player } from './player';
import type { Players } from './players';
import { AsyncTask } from './types';
import { GAME_UI } from './dependencies.config';

/**
 * {@link `glossary["Storyteller"]`}
 * The person who runs the game. The Storyteller keeps the Grimoire, follows the rules of the game, and makes the final decision on what happens when a situation needs adjudication.
 */
export class StoryTeller {
    static DEFAULT_WAKE_REASON =
        'Player is awaken to act or receive information';

    protected grimoire?: Grimoire;

    protected infoProviderLoader: InfoProviderLoader = new InfoProviderLoader();

    async getGrimoire(_requestedPlayer: Player): Promise<Grimoire> {
        await new BlankGrimoire(this).throwWhen(
            (error) => error.storyteller.grimoire === undefined
        );

        // TODO
        return this.grimoire!;
    }

    async interact(player: Player, action: AsyncTask<Player>, reason?: string) {
        if (reason === undefined) {
            reason = action.toString();
        }

        await action(player);
    }

    initializeGrimoire(players: Players) {
        this.grimoire = new Grimoire(players);
    }

    /**
     * {@link `glossary["Wake"]`}
     * A player opening their eyes at night. The Storyteller wakes a player by tapping twice on the knee or shoulder, and wakes all players by saying “eyes open, everybody” at dawn.
     */
    async wake(
        player: Player,
        action: AsyncTask<Player>,
        reason: string = StoryTeller.DEFAULT_WAKE_REASON
    ) {
        player.isWake = true;

        await this.interact(player, action, reason);

        player.isWake = false;
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
            const info = (await GAME_UI.storytellerChooseOne(
                infoOptions,
                context.reason
            )) as InfoType;
            return info;
        }
    }
}
