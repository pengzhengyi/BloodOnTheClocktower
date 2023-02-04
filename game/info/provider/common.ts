import {
    type OneOfTwoPlayersHasCharacterType,
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
} from '../information';
import { type InfoProvideContext, InformationProvider } from './provider';
import { Generator } from '~/game/collections';
import type { IPlayer } from '~/game/player';
import { type CharacterType } from '~/game/character-type';
import type { MinionPlayer } from '~/game/types';

export abstract class DemonMinionInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> extends InformationProvider<TInfoProvideContext, TInformation> {
    protected async getMinionPlayers(
        context: TInfoProvideContext
    ): Promise<Array<MinionPlayer>> {
        const minionPlayers = await context.players
            .clone()
            .isNot(context.requestedPlayer)
            .from(context.requestedPlayer)
            .isMinion.then((players) =>
                Generator.map((player) => player.from(), players)
            );

        return Array.from(minionPlayers) as IPlayer[];
    }

    protected async getDemonPlayer(
        context: TInfoProvideContext
    ): Promise<IPlayer> {
        const demonPlayer = await context.players
            .clone()
            .from(context.requestedPlayer)
            .isDemon.then((players) =>
                Generator.map((player) => player.from(), players)
            );

        return Generator.take(1, demonPlayer) as IPlayer;
    }

    protected getHypotheticalCombinationsForMinionPlayers(
        context: TInfoProvideContext
    ): Generator<Array<IPlayer>> {
        return context.players
            .isNot(context.requestedPlayer)
            .combinations(context.travellerSheet.actualAssignment.minion);
    }

    protected async evaluateGoodnessForMinions(
        minions: Array<MinionPlayer>
    ): Promise<number> {
        const isMinions = await Generator.promiseAll(
            Generator.toPromise((minion) => minion.isMinion, minions)
        );

        return Generator.reduce(
            (score, isMinion) => score + (isMinion ? 5 : -5),
            0,
            isMinions
        );
    }
}

export abstract class OneOfTwoPlayersHasCharacterTypeInformationProvider<
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
            await Generator.anyAsync(
                (characterType) => characterType.is(this.expectedCharacterType),
                Generator.promiseRaceAll(
                    Generator.toPromise(
                        (player) => player.characterType,
                        information.players
                    )
                )
            )
        ) {
            return 1;
        } else {
            return -1;
        }
    }

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>> {
        const expectedCharacterTypePlayers = await context.players
            .clone()
            .isNot(context.requestedPlayer)
            .from(context.requestedPlayer)
            .isCharacterType(this.expectedCharacterType)
            .then((players) =>
                Generator.map((player) => player.from(), players)
            );

        const infoOptionsByPlayer = await Generator.promiseAll(
            Generator.toPromise(async (player) => {
                const character = await player.from(context.requestedPlayer)
                    .character;
                return Generator.once([player])
                    .cartesian_product(
                        context.players
                            .clone()
                            .exclude([context.requestedPlayer, player])
                    )
                    .map((players) =>
                        Information.true({
                            players,
                            character,
                            characterType: this.expectedCharacterType,
                        } as TInformation)
                    );
            }, expectedCharacterTypePlayers)
        );

        const infoOptions = Generator.once(
            Generator.chain_from_iterable(infoOptionsByPlayer)
        );

        return infoOptions;
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
