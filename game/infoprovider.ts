import { CharacterType, Minion, Outsider, Townsfolk } from './charactertype';
import { Generator, LazyMap } from './collections';
import {
    ChefInformation,
    DemonInformation,
    EmpathInformation,
    FalseInformation,
    FalseInformationOptions,
    FortuneTellerInformation,
    InfoOptions,
    Information,
    InvestigatorInformation,
    LibrarianInformation,
    LibrarianNoOutsiderInformation,
    OneOfTwoPlayersHasCharacterType,
    OneOfTwoPlayersIsOutsider,
    StoryTellerInformationOptions,
    TrueInformationOptions,
    UndertakerInformation,
    WasherwomanInformation,
} from './information';
import {
    ChefInformationRequester,
    DemonInformationRequester,
    EmpathInformationRequester,
    FortuneTellerInformationRequester,
    IInfoRequester,
    InfoRequestContext,
    LibrarianInformationRequester,
    UndertakerInformationRequester,
    WasherwomanInformationRequester,
} from './inforequester';
import { Player } from './player';
import type { CharacterToken } from './character';
import type { CharacterSheet } from './charactersheet';
import type { Clocktower } from './clocktower';
import { Players } from './players';
import type { Seating } from './seating';
import type { StoryTeller } from './storyteller';
import type { TravellerSheet } from './travellersheet';
import { InvestigatorInfoRequester } from './info';
import { GAME_UI } from '~/interaction/gameui';

export interface InfoProvideContext {
    clocktower: Clocktower;
    characterSheet: CharacterSheet;
    travellerSheet: TravellerSheet;
    requestedPlayer: Player;
    players: Players;
    storyteller: StoryTeller;
    seating: Seating;
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
     * @param evaluationContext A context used for caching expensive computation purpose in evaluation of information goodness. By passing in same evaluation context, the implementation might take advantage of any saved information.
     * @returns A score indicating how "good" a piece of information is to its requester.
     */
    evaluateGoodness(
        information: TInformation,
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
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
        _context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        return await 0;
    }

    protected async buildEvaluationContext(
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<LazyMap<string, any>> {
        evaluationContext ??= new LazyMap(() => undefined);

        return await this.buildEvaluationContextImpl(
            context,
            evaluationContext
        );
    }

    protected async buildEvaluationContextImpl(
        _context: TInfoProvideContext,
        evaluationContext: LazyMap<string, any>
    ): Promise<LazyMap<string, any>> {
        return await evaluationContext;
    }
}

export class DemonInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends InformationProvider<TInfoProvideContext, DemonInformation> {
    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<DemonInformation>> {
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
            })
        );

        return await infoOptions;
    }

    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<DemonInformation>> {
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
            })
        );

        return await infoOptions;
    }

    /**
     * @override Goodness is evaluated on the following criterion: 5 for each player that is a minion, -5 if not; 3 for each character that is not in play, -3 if not.
     */
    async evaluateGoodness(
        information: DemonInformation,
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
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    WasherwomanInformation
> {
    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}

export class LibrarianInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    OneOfTwoPlayersIsOutsider
> {
    static readonly NO_OUTSIDER_INFORMATION: LibrarianInformation = {
        noOutsiders: true,
    };

    protected expectedCharacterType: typeof CharacterType = Outsider;

    async evaluateGoodness(
        information: LibrarianInformation,
        context: TInfoProvideContext
    ): Promise<number> {
        if ((information as LibrarianNoOutsiderInformation).noOutsiders) {
            return context.players.any((player) => player.isOutsider) ? -1 : 1;
        } else {
            return await super.evaluateGoodness(
                information as OneOfTwoPlayersIsOutsider,
                context
            );
        }
    }

    // @ts-ignore: allow different return type for overridden method
    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<LibrarianInformation>> {
        const infoOptions = (await super.getTrueInformationOptions(
            context
        )) as TrueInformationOptions<LibrarianInformation>;
        const options: TrueInformationOptions<LibrarianInformation> =
            infoOptions.orElse(
                Information.true(
                    LibrarianInformationProvider.NO_OUTSIDER_INFORMATION
                )
            );

        return options;
    }

    // @ts-ignore: allow different return type for overridden method
    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<LibrarianInformation>> {
        const infoOptions = (await super.getFalseInformationOptions(
            context
        )) as Generator<FalseInformation<LibrarianInformation>>;
        const options: Generator<FalseInformation<LibrarianInformation>> =
            infoOptions.push(
                Information.false({
                    noOutsiders: true,
                }) as FalseInformation<LibrarianInformation>
            );

        return options;
    }
}

export class InvestigatorInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    InvestigatorInformation
> {
    protected expectedCharacterType: typeof CharacterType = Minion;
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

    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<ChefInformation>> {
        const numPlayers = await context.players.length;

        return Generator.once(
            Generator.map(
                (numPairEvilPlayers) =>
                    Information.false({ numPairEvilPlayers }),
                Generator.range(0, numPlayers + 1)
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

        for await (const _players of context.seating.iterateNeighbors()) {
            const players = shouldFromRequestedPlayerPerspective
                ? _players.map((player) => player.from(context.requestedPlayer))
                : _players;

            if (Players.allEvil(players)) {
                numPairEvilPlayers++;
            }
        }

        return numPairEvilPlayers;
    }
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

    async getFalseInformationOptions(
        _context: TInfoProvideContext
    ): Promise<FalseInformationOptions<EmpathInformation>> {
        await undefined;
        return Generator.once(
            Generator.map(
                (numEvilAliveNeighbors) =>
                    Information.false({
                        numEvilAliveNeighbors,
                    }) as FalseInformation<EmpathInformation>,
                Generator.range(0, 3)
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
        const aliveNeighbors = await context.seating.getAliveNeighbors(
            context.requestedPlayer,
            (seat) => {
                const player = shouldFromRequestedPlayerPerspective
                    ? seat.player?.from(context.requestedPlayer)
                    : seat.player;

                return player?.alive ?? false;
            }
        );

        return aliveNeighbors.reduce((accumulator, _player) => {
            const player = shouldFromRequestedPlayerPerspective
                ? _player.from(context.requestedPlayer)
                : _player;
            const newValue = accumulator + (player.isEvil ? 1 : 0);

            return newValue;
        }, 0);
    }
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

    async getFalseInformationOptions(
        context: FortuneTellerInformationProviderContext
    ): Promise<FalseInformationOptions<FortuneTellerInformation>> {
        await undefined;
        return Generator.once(
            Generator.map(
                (hasDemon) =>
                    Information.false({
                        chosenPlayers: context.chosenPlayers,
                        hasDemon,
                    }) as FalseInformation<FortuneTellerInformation>,
                [true, false]
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

        return await players.some((player) => player.isDemon);
    }
}
export interface UndertakerInformationProviderContext
    extends InfoProvideContext {
    executedPlayer: Player;
}

export class UndertakerInformationProvider<
    TInfoProvideContext extends UndertakerInformationProviderContext
> extends InformationProvider<TInfoProvideContext, UndertakerInformation> {
    async getTrueInformationOptions(
        context: UndertakerInformationProviderContext
    ): Promise<TrueInformationOptions<UndertakerInformation>> {
        await undefined;
        const perceivedCharacter = context.executedPlayer.from(
            context.requestedPlayer
        ).character;
        return Generator.once([
            Information.true({
                executedPlayer: context.executedPlayer,
                character: perceivedCharacter,
            } as UndertakerInformation),
        ]);
    }

    async getFalseInformationOptions(
        context: UndertakerInformationProviderContext
    ): Promise<FalseInformationOptions<UndertakerInformation>> {
        await undefined;
        return Generator.once(
            Generator.map(
                (character) =>
                    Information.false({
                        executedPlayer: context.executedPlayer,
                        character,
                    }) as FalseInformation<UndertakerInformation>,
                context.characterSheet.characters
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual character and provided character in information match , -1 otherwise.
     */
    async evaluateGoodness(
        information: UndertakerInformation,
        context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        await undefined;
        return context.executedPlayer.character === information.character
            ? 1
            : -1;
    }
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
        } else if (requester instanceof LibrarianInformationRequester) {
            return this.providers.get(LibrarianInformationProvider);
        } else if (requester instanceof InvestigatorInfoRequester) {
            return this.providers.get(InvestigatorInformationProvider);
        } else if (requester instanceof ChefInformationRequester) {
            return this.providers.get(ChefInformationProvider);
        } else if (requester instanceof EmpathInformationRequester) {
            return this.providers.get(EmpathInformationProvider);
        } else if (requester instanceof FortuneTellerInformationRequester) {
            return this.providers.get(FortuneTellerInformationProvider);
        } else if (requester instanceof UndertakerInformationRequester) {
            return this.providers.get(UndertakerInformationRequester);
        } else if (requester instanceof DemonInformationRequester) {
            return this.providers.get(DemonInformationProvider);
        }
    }
}
