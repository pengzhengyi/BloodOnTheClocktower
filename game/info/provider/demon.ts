import {
    FalseInformationOptions,
    Information,
    TrueInformationOptions,
} from '../information';
import { DemonMinionInformationProvider } from './common';
import { InfoProvideContext } from './provider';
import type { CharacterToken } from '~/game/character';
import { Generator, LazyMap } from '~/game/collections';
import type { MinionPlayer } from '~/game/player';

/**
 * {@link `glossary["Demon Info"]`}
 * Shorthand on the night sheet, representing the information that the Demon receives on the first night if there are 7 or more players. The Demon learns which players are the Minions, and learns 3 good characters that are not in play to help them bluff.
 */
export interface DemonInformation {
    minions: Array<MinionPlayer>;
    notInPlayGoodCharacters: [CharacterToken, CharacterToken, CharacterToken];
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
        const minionPlayers = await this.getMinionPlayers(context);

        const notInPlayGoodCharacters = await this.getNotInPlayGoodCharacters(
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

        return infoOptions;
    }

    getFalseInformationOptions(
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

        return Promise.resolve(infoOptions);
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

        let score = await this.evaluateGoodnessForMinions(information.minions);

        score += Generator.reduce(
            (score, character) =>
                score + (goodCharactersNotInPlay.has(character) ? 6 : 0),
            -9,
            information.notInPlayGoodCharacters
        );
        return score;
    }

    protected async buildEvaluationContextImpl(
        context: TInfoProvideContext,
        evaluationContext: LazyMap<string, any>
    ) {
        if (
            !evaluationContext.has(
                DemonInformationProvider.cachedKeyForGoodCharactersNotInPlay
            )
        ) {
            const charactersNotInPlay = new Set<CharacterToken>();
            const notInPlayGoodCharacters =
                await this.getNotInPlayGoodCharacters(context, false);

            for (const character of notInPlayGoodCharacters) {
                charactersNotInPlay.add(character);
            }

            evaluationContext.set(
                DemonInformationProvider.cachedKeyForGoodCharactersNotInPlay,
                charactersNotInPlay
            );
        }

        return evaluationContext;
    }

    protected async getNotInPlayGoodCharacters(
        context: TInfoProvideContext,
        shouldFromRequestedPlayerPerspective: boolean
    ): Promise<Iterable<CharacterToken>> {
        const players = shouldFromRequestedPlayerPerspective
            ? context.players.clone().from(context.requestedPlayer)
            : context.players.clone();

        const charactersInPlay = await players
            .toPromise((player) => player.character)
            .promiseAll();

        return Generator.filter(
            (character) => character.isGoodCharacter,
            context.characterSheet.getCharactersNotInPlay(charactersInPlay)
        );
    }
}
