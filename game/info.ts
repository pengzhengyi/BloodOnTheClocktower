import { Character } from './character';
import { MinionPlayer, DemonPlayer, Player } from './player';
import { Generator } from './collections';
import { GameInfo } from './gameinfo';
import { Washerwoman } from '~/content/characters/output/washerwoman';

/**
 * {@link `glossary["Demon Info"]`}
 * Shorthand on the night sheet, representing the information that the Demon receives on the first night if there are 7 or more players. The Demon learns which players are the Minions, and learns 3 good characters that are not in play to help them bluff.
 */
export interface DemonInfo {
    minions: Array<MinionPlayer>;
    notInPlayGoodCharacters: [Character, Character, Character];
}

/**
 * {@link `glossary["Minion info"]`}
 * Shorthand on the night sheet, representing the information that the Minions receive on the first night if there are 7 or more players. The Minions learn which other players are Minions, and which player the Demon is.
 */
export interface MinionInfo {
    minions: Array<MinionPlayer>;
    demon: Array<DemonPlayer>;
}

export abstract class InfoHelper<T> {
    constructor(readonly receiver: Player, readonly isTrue: boolean) {
        this.receiver = receiver;
        this.isTrue = isTrue;
    }

    abstract trueInfoCandidates(gameInfo: GameInfo): Generator<T>;
    abstract falseInfoCandidates(gameInfo: GameInfo): Generator<T>;

    candidates(gameInfo: GameInfo): Generator<T> {
        return this.isTrue
            ? this.trueInfoCandidates(gameInfo)
            : this.falseInfoCandidates(gameInfo);
    }
}

export interface WasherwomanInfo {
    players: [Player, Player];

    character: typeof Character;
}

export class WasherwomanInfoHelper extends InfoHelper<WasherwomanInfo> {
    declare receiver: Player & { character: typeof Washerwoman };

    trueInfoCandidates(gameInfo: GameInfo) {
        const townsfolkCandidates = gameInfo.players
            .isNot(this.receiver)
            .isTownsfolk();
        const washerwomanInfoCandidates = townsfolkCandidates.map((player) =>
            Generator.once([player])
                .cartesian_product(
                    gameInfo.players.exclude([this.receiver, player])
                )
                .map(
                    (players) =>
                        ({
                            players,
                            character: player.character,
                        } as WasherwomanInfo)
                )
        );

        return Generator.once(
            Generator.chain_from_iterable<WasherwomanInfo>(
                washerwomanInfoCandidates
            )
        );
    }

    falseInfoCandidates(gameInfo: GameInfo) {
        const playersCandidates = gameInfo.players
            .isNot(this.receiver)
            .combinations(2);
        return playersCandidates
            .cartesian_product(gameInfo.characterSheet.townsfolk)
            .map(
                ([players, character]) =>
                    ({ players, character } as WasherwomanInfo)
            );
    }
}
