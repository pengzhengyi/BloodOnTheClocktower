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
    MinionInformation,
    OneOfTwoPlayersHasCharacterType,
    OneOfTwoPlayersIsOutsider,
    RavenkeeperInformation,
    SpyInformation,
    StoryTellerInformation,
    StoryTellerInformationOptions,
    TravellerInformation,
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
    InvestigatorInformationRequester,
    LibrarianInformationRequester,
    MinionInformationRequester,
    RavenkeeperInformationRequester,
    SpyInformationRequester,
    TravellerInformationRequester,
    UndertakerInformationRequester,
    WasherwomanInformationRequester,
} from './inforequester';
import { MinionPlayer, Player } from './player';
import type { CharacterToken } from './character';
import type { CharacterSheet } from './charactersheet';
import type { Clocktower } from './clocktower';
import { Players } from './players';
import type { Seating } from './seating';
import type { StoryTeller } from './storyteller';
import type { TravellerSheet } from './travellersheet';
import type { Constructor } from './types';

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

export abstract class InfoProvider<_TInformation> {}

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

export abstract class DemonMinionInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> extends InformationProvider<TInfoProvideContext, TInformation> {
    protected getMinionPlayers(
        context: TInfoProvideContext
    ): Array<MinionPlayer> {
        return context.players
            .clone()
            .isNot(context.requestedPlayer)
            .from(context.requestedPlayer)
            .isMinion.from()
            .take() as Player[];
    }

    protected getHypotheticalCombinationsForMinionPlayers(
        context: TInfoProvideContext
    ): Generator<Array<Player>> {
        return context.players
            .isNot(context.requestedPlayer)
            .combinations(context.travellerSheet.actualAssignment.minion);
    }
}

export class DemonInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends DemonMinionInformationProvider<
    TInfoProvideContext,
    DemonInformation
> {
    protected static readonly cachedKeyForGoodCharactersNotInPlay =
        'actualGoodCharactersNotInPlay';

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<DemonInformation>> {
        const minionPlayers = this.getMinionPlayers(context);

        const notInPlayGoodCharacters = this.getNotInPlayGoodCharacters(
            context,
            true
        );

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
        const perceivedMinionPlayersCombinations =
            this.getHypotheticalCombinationsForMinionPlayers(context);

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
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        evaluationContext = await this.buildEvaluationContext(
            context,
            evaluationContext
        );
        const goodCharactersNotInPlay: Set<CharacterToken> =
            evaluationContext.getOrDefault(
                DemonInformationProvider.cachedKeyForGoodCharactersNotInPlay,
                new Set<CharacterToken>()
            );

        let score = Generator.reduce(
            (score, minion) => score + (minion.isMinion ? 5 : -5),
            0,
            information.minions
        );

        score += Generator.reduce(
            (score, character) =>
                score + (goodCharactersNotInPlay.has(character) ? 6 : 0),
            -9,
            information.notInPlayGoodCharacters
        );
        return await score;
    }

    protected buildEvaluationContextImpl(
        context: TInfoProvideContext,
        evaluationContext: LazyMap<string, any>
    ) {
        if (
            !evaluationContext.has(
                DemonInformationProvider.cachedKeyForGoodCharactersNotInPlay
            )
        ) {
            const charactersNotInPlay = new Set<CharacterToken>();
            const notInPlayGoodCharacters = this.getNotInPlayGoodCharacters(
                context,
                false
            );

            for (const character of notInPlayGoodCharacters) {
                charactersNotInPlay.add(character);
            }

            evaluationContext.set(
                DemonInformationProvider.cachedKeyForGoodCharactersNotInPlay,
                charactersNotInPlay
            );
        }

        return Promise.resolve(evaluationContext);
    }

    protected getNotInPlayGoodCharacters(
        context: TInfoProvideContext,
        shouldFromRequestedPlayerPerspective: boolean
    ): Iterable<CharacterToken> {
        const players = shouldFromRequestedPlayerPerspective
            ? context.players.clone().from(context.requestedPlayer)
            : context.players.clone();

        const charactersInPlay = players.map((player) => player.character);

        return Generator.filter(
            (character) => character.isGoodCharacter,
            context.characterSheet.getCharactersNotInPlay(charactersInPlay)
        );
    }
}

export class MinionInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends DemonMinionInformationProvider<
    TInfoProvideContext,
    MinionInformation
> {
    getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<MinionInformation>> {
        const otherMinions = this.getMinionPlayers(context);

        const demon = context.players
            .clone()
            .from(context.requestedPlayer)
            .isDemon.from()
            .take(1) as Player;

        return Promise.resolve(
            Generator.once([
                Information.true({
                    otherMinions,
                    demon,
                }),
            ])
        );
    }

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<MinionInformation>> {
        const hypotheticalCombinationsForMinionPlayers =
            this.getHypotheticalCombinationsForMinionPlayers(context);

        const hypotheticalCandidatesForDemon = context.players.isNot(
            context.requestedPlayer
        );

        const infoOptions = Generator.once(
            Generator.cartesian_product(
                hypotheticalCombinationsForMinionPlayers,
                hypotheticalCandidatesForDemon
            )
        ).map(([otherMinions, demon]) =>
            Information.false({
                otherMinions,
                demon,
            })
        );

        return Promise.resolve(infoOptions);
    }

    /**
     * @override Goodness is evaluated on the following criterion: 5 for each player that is a minion, -5 if not; 5 for provided player is the demon.
     */
    evaluateGoodness(
        information: MinionInformation,
        _context: TInfoProvideContext
    ): Promise<number> {
        let score = Generator.reduce(
            (score, minion) => score + (minion.isMinion ? 5 : -5),
            0,
            information.otherMinions
        );

        score += information.demon.isDemon ? 5 : -5;
        return Promise.resolve(score);
    }
}

export class TravellerInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends InformationProvider<TInfoProvideContext, TravellerInformation> {
    getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TravellerInformation>> {
        const demon = context.players
            .clone()
            .from(context.requestedPlayer)
            .isDemon.from()
            .take(1) as Player;

        return Promise.resolve(
            Generator.once([
                Information.true({
                    demon,
                }),
            ])
        );
    }

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TravellerInformation>> {
        const hypotheticalCandidatesForDemon = context.players.isNot(
            context.requestedPlayer
        );

        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (demon) =>
                        Information.false({
                            demon,
                        }),
                    hypotheticalCandidatesForDemon
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 provided player is the demon, -1 otherwise.
     */
    evaluateGoodness(
        information: TravellerInformation,
        _context: TInfoProvideContext
    ): Promise<number> {
        return Promise.resolve(information.demon.isDemon ? 1 : -1);
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

    getTrueInformationOptions(
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

        return Promise.resolve(infoOptions);
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

            if (await Players.allEvil(players)) {
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
        const aliveNeighbors = await context.seating.getAliveNeighbors(
            context.requestedPlayer,
            (seat) => {
                const player = shouldFromRequestedPlayerPerspective
                    ? seat.player?.from(context.requestedPlayer)
                    : seat.player;

                return player?.alive ?? false;
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
        aliveNeighbor: Player,
        empathPlayer: Player,
        shouldFromRequestedPlayerPerspective: boolean
    ): Promise<boolean> {
        const player = shouldFromRequestedPlayerPerspective
            ? aliveNeighbor.from(empathPlayer)
            : aliveNeighbor;

        return await player.isEvil;
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
    getTrueInformationOptions(
        context: UndertakerInformationProviderContext
    ): Promise<TrueInformationOptions<UndertakerInformation>> {
        const perceivedCharacter = context.executedPlayer.from(
            context.requestedPlayer
        ).character;
        return Promise.resolve(
            Generator.once([
                Information.true({
                    executedPlayer: context.executedPlayer,
                    character: perceivedCharacter,
                } as UndertakerInformation),
            ])
        );
    }

    getFalseInformationOptions(
        context: UndertakerInformationProviderContext
    ): Promise<FalseInformationOptions<UndertakerInformation>> {
        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (character) =>
                        Information.false({
                            executedPlayer: context.executedPlayer,
                            character,
                        }) as FalseInformation<UndertakerInformation>,
                    context.characterSheet.characters
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual character and provided character in information match , -1 otherwise.
     */
    evaluateGoodness(
        information: UndertakerInformation,
        context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        return Promise.resolve(
            context.executedPlayer.character === information.character ? 1 : -1
        );
    }
}

export interface RavenkeeperInformationProviderContext
    extends InfoProvideContext {
    chosenPlayer: Player;
}

export class RavenkeeperInformationProvider<
    TInfoProvideContext extends RavenkeeperInformationProviderContext
> extends InformationProvider<TInfoProvideContext, RavenkeeperInformation> {
    getTrueInformationOptions(
        context: RavenkeeperInformationProviderContext
    ): Promise<TrueInformationOptions<RavenkeeperInformation>> {
        const perceivedCharacter = context.chosenPlayer.from(
            context.requestedPlayer
        ).character;
        return Promise.resolve(
            Generator.once([
                Information.true({
                    chosenPlayer: context.chosenPlayer,
                    character: perceivedCharacter,
                } as RavenkeeperInformation),
            ])
        );
    }

    getFalseInformationOptions(
        context: RavenkeeperInformationProviderContext
    ): Promise<FalseInformationOptions<RavenkeeperInformation>> {
        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (character) =>
                        Information.false({
                            chosenPlayer: context.chosenPlayer,
                            character,
                        }) as FalseInformation<RavenkeeperInformation>,
                    context.characterSheet.characters
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual character and provided character in information match , -1 otherwise.
     */
    evaluateGoodness(
        information: RavenkeeperInformation,
        context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        return Promise.resolve(
            context.chosenPlayer.character === information.character ? 1 : -1
        );
    }
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

type InfoProviderConstructor<TInformation> = Constructor<
    InfoProvider<TInformation>
>;

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

        let method:
            | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
            | undefined;
        if (isStoryTellerInformation) {
            method = (
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
            method = willGetTrueInformation
                ? informationProvider.getTrueInformationOptions
                : informationProvider.getFalseInformationOptions;
        }

        return method?.bind(infoProvider);
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
        } else if (requester instanceof InvestigatorInformationRequester) {
            return this.providers.get(InvestigatorInformationProvider);
        } else if (requester instanceof ChefInformationRequester) {
            return this.providers.get(ChefInformationProvider);
        } else if (requester instanceof EmpathInformationRequester) {
            return this.providers.get(EmpathInformationProvider);
        } else if (requester instanceof FortuneTellerInformationRequester) {
            return this.providers.get(FortuneTellerInformationProvider);
        } else if (requester instanceof UndertakerInformationRequester) {
            return this.providers.get(UndertakerInformationProvider);
        } else if (requester instanceof RavenkeeperInformationRequester) {
            return this.providers.get(RavenkeeperInformationProvider);
        } else if (requester instanceof SpyInformationRequester) {
            return this.providers.get(SpyInformationProvider);
        } else if (requester instanceof DemonInformationRequester) {
            return this.providers.get(DemonInformationProvider);
        } else if (requester instanceof MinionInformationRequester) {
            return this.providers.get(MinionInformationProvider);
        } else if (requester instanceof TravellerInformationRequester) {
            return this.providers.get(TravellerInformationProvider);
        }
    }
}
