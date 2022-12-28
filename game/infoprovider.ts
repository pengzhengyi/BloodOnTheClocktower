import { CharacterType, Townsfolk } from './charactertype';
import { Generator, LazyMap } from './collections';
import {
    DemonInformation,
    FalseInformationOptions,
    InfoOptions,
    Information,
    OneOfTwoPlayersHasCharacterType,
    StoryTellerInformationOptions,
    TrueInformationOptions,
    WasherwomanInformation,
} from './information';
import {
    DemonInformationRequester,
    IInfoRequester,
    InfoRequestContext,
    WasherwomanInformationRequester,
} from './inforequester';
import { Player } from './player';
import type { CharacterToken } from './character';
import type { CharacterSheet } from './charactersheet';
import type { Clocktower } from './clocktower';
import type { Players } from './players';
import type { StoryTeller } from './storyteller';
import type { TravellerSheet } from './travellersheet';
import { GAME_UI } from '~/interaction/gameui';

export interface InfoProvideContext {
    clocktower: Clocktower;
    characterSheet: CharacterSheet;
    travellerSheet: TravellerSheet;
    requestedPlayer: Player;
    players: Players;
    storyteller: StoryTeller;
    reason?: string;
}

export interface IInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> {
    /**
     * Give a score for a piece of information based on its "goodness". Positive score means this information is helpful while negative score means it is misleading. Zero means no evaluation is provided. This score can be used in UI to sort options available for storyteller to choose from.
     * @param information The information to be evaluated.
     * @param context The context where the information is requested
     * @returns A score indicating how "good" a piece of information is to its requester.
     */
    evaluateGoodness(
        information: TInformation,
        context: TInfoProvideContext
    ): Promise<number>;

    getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>>;

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TInformation>>;
}

export interface IStoryTellerInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> {
    getStoryTellerInformationOptions(
        context: TInfoProvideContext
    ): Promise<StoryTellerInformationOptions<TInformation>>;
}

export type IInfoProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> =
    | IInformationProvider<TInfoProvideContext, TInformation>
    | IStoryTellerInformationProvider<TInfoProvideContext, TInformation>;

export abstract class InfoProvider<_TInformation> {
    static chooseOne<TInformation>(
        infoOptions: InfoOptions<TInformation>,
        reason?: string
    ) {
        return GAME_UI.storytellerChooseOne(infoOptions, reason);
    }
}

export abstract class InformationProvider<
        TInfoProvideContext extends InfoProvideContext,
        TInformation
    >
    extends InfoProvider<TInformation>
    implements IInformationProvider<TInfoProvideContext, TInformation>
{
    abstract getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>>;

    abstract getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TInformation>>;

    async evaluateGoodness(
        _information: TInformation,
        _context: TInfoProvideContext
    ): Promise<number> {
        return await 0;
    }
}

export class DemonInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation extends DemonInformation
> extends InformationProvider<TInfoProvideContext, TInformation> {
    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>> {
        const minionPlayers = context.players
            .clone()
            .from(context.requestedPlayer)
            .isMinion.from()
            .take() as Player[];

        const goodCharactersInPlay = context.players
            .clone()
            .from(context.requestedPlayer)
            .map((player) => player.character)
            .filter((character) => character.isGoodCharacter);

        const notInPlayGoodCharacters =
            context.characterSheet.getCharactersNotInPlay(goodCharactersInPlay);

        const notInPlayGoodCharactersCombinations = Generator.combinations(
            3,
            notInPlayGoodCharacters
        ) as Iterable<[CharacterToken, CharacterToken, CharacterToken]>;

        const infoOptions = Generator.once(
            Generator.cartesian_product(
                [minionPlayers],
                notInPlayGoodCharactersCombinations
            )
        ).map(([minions, notInPlayGoodCharacters]) =>
            Information.true({
                minions,
                notInPlayGoodCharacters,
            } as TInformation)
        );

        return await infoOptions;
    }

    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TInformation>> {
        const perceivedMinionPlayersCombinations = context.players
            .isNot(context.requestedPlayer)
            .combinations(context.travellerSheet.actualAssignment.minion);

        const perceivedNotInPlayerGoodCharacters = Generator.filter(
            (character) => character.isGoodCharacter,
            context.characterSheet.characters
        );

        const notInPlayGoodCharactersCombinations = Generator.combinations(
            3,
            perceivedNotInPlayerGoodCharacters
        ) as Iterable<[CharacterToken, CharacterToken, CharacterToken]>;

        const infoOptions = Generator.once(
            Generator.cartesian_product(
                perceivedMinionPlayersCombinations,
                notInPlayGoodCharactersCombinations
            )
        ).map(([minions, notInPlayGoodCharacters]) =>
            Information.false({
                minions,
                notInPlayGoodCharacters,
            } as TInformation)
        );

        return await infoOptions;
    }

    /**
     * @override Goodness is evaluated on the following criterion: 5 for each player that is a minion, -5 if not; 3 for each character that is not in play, -3 if not.
     */
    async evaluateGoodness(
        information: TInformation,
        context: TInfoProvideContext
    ): Promise<number> {
        let score = Generator.reduce(
            (score, minion) => score + (minion.isMinion ? 5 : -5),
            0,
            information.minions
        );

        score += Generator.reduce(
            (score, _character) => score + 6,
            -9,
            Generator.exclude(
                information.notInPlayGoodCharacters,
                context.players.charactersInPlay
            )
        );
        return await score;
    }
}

abstract class OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation extends OneOfTwoPlayersHasCharacterType
> extends InformationProvider<TInfoProvideContext, TInformation> {
    protected abstract expectedCharacterType: typeof CharacterType;

    /**
     * @override Goodness is evaluated on the following criterion: if there is any player matching expected character type, it gets a score of 1; otherwise, a score of -1.
     */
    async evaluateGoodness(
        information: TInformation,
        _context: TInfoProvideContext
    ): Promise<number> {
        if (
            information.players.some((player) =>
                Player.isCharacterType(player, this.expectedCharacterType)
            )
        ) {
            return await 1;
        } else {
            return -1;
        }
    }

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>> {
        const infoOptionsByPlayer = context.players
            .clone()
            .isNot(context.requestedPlayer)
            .from(context.requestedPlayer)
            .isCharacterType(this.expectedCharacterType)
            .from()
            .map((player) =>
                Generator.once([player])
                    .cartesian_product(
                        context.players
                            .clone()
                            .exclude([context.requestedPlayer, player])
                    )
                    .map((players) =>
                        Information.true({
                            players,
                            character: player.character,
                            characterType: this.expectedCharacterType,
                        } as TInformation)
                    )
            );

        const infoOptions: TrueInformationOptions<TInformation> =
            Generator.once(Generator.chain_from_iterable(infoOptionsByPlayer));

        return await infoOptions;
    }

    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TInformation>> {
        const playersCombinations = context.players
            .isNot(context.requestedPlayer)
            .combinations(2);

        const options: FalseInformationOptions<TInformation> =
            playersCombinations
                .cartesian_product(
                    context.characterSheet.getCharactersByType(
                        this.expectedCharacterType
                    )
                )
                .map(([players, character]) =>
                    Information.false({
                        players,
                        character,
                        characterType: this.expectedCharacterType,
                    } as TInformation)
                );

        return await options;
    }
}

export class WasherwomanInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation extends WasherwomanInformation
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    TInformation
> {
    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}

type InfoProviderConstructor<TInformation> = new (
    ...args: any[]
) => InfoProvider<TInformation>;

export type InfoProviderMethod<
    TInformation,
    TInfoProvideContext extends InfoProvideContext
> = (context: TInfoProvideContext) => Promise<InfoOptions<TInformation>>;

export class InfoProviders<TInformation = any> {
    protected providers: LazyMap<
        InfoProviderConstructor<TInformation>,
        InfoProvider<TInformation>
    > = new LazyMap((InfoProviderClass) => new InfoProviderClass());

    getInfoProviderMethod(
        requester: IInfoRequester<
            TInformation,
            InfoRequestContext<TInformation>
        >,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ):
        | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
        | undefined {
        const infoProvider = this.getInfoProvider(requester);

        if (infoProvider === undefined) {
            return undefined;
        }

        if (isStoryTellerInformation) {
            return (
                infoProvider as IStoryTellerInformationProvider<
                    InfoRequestContext<TInformation>,
                    TInformation
                >
            ).getStoryTellerInformationOptions;
        } else if (willGetTrueInformation !== undefined) {
            const informationProvider = infoProvider as IInformationProvider<
                InfoRequestContext<TInformation>,
                TInformation
            >;
            return willGetTrueInformation
                ? informationProvider.getTrueInformationOptions
                : informationProvider.getFalseInformationOptions;
        }
    }

    getInfoProvider(
        requester: IInfoRequester<
            TInformation,
            InfoRequestContext<TInformation>
        >
    ): InfoProvider<TInformation> | undefined {
        if (requester instanceof WasherwomanInformationRequester) {
            return this.providers.get(WasherwomanInformationProvider);
        } else if (requester instanceof DemonInformationRequester) {
            return this.providers.get(DemonInformationProvider);
        }
    }
}
