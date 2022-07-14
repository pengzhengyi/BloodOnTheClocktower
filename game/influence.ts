import { Alignment } from './alignment';
import { Character } from './character';
import { CharacterSheet } from './charactersheet';
import { Generator } from './collections';
import { IncorrectAlignmentForSpyToRegisterAs } from './exception';
import { GameInfo } from './gameinfo';
import { Player } from './player';
import { Spy } from '~/content/characters/output/spy';
import { GameUI } from '~/interaction/gameui';

export interface InfluenceApplyContext {
    unbiasedGameInfo: GameInfo;
    reason?: string;
}

export abstract class Influence {
    constructor(readonly source: unknown, readonly description: string) {
        this.source = source;
        this.description = description;
    }

    abstract apply(
        gameInfo: GameInfo,
        context: InfluenceApplyContext
    ): GameInfo;
}

export class Influences extends Influence {
    declare source: Array<Influence>;

    apply(gameInfo: GameInfo, context: InfluenceApplyContext): GameInfo {
        return this.source.reduce(
            (gameInfo, influence) => influence.apply(gameInfo, context),
            gameInfo
        );
    }
}

export class SpyInfluence extends Influence {
    static readonly description: string =
        'The Spy might appear to be a good character, but is actually evil. The Spy might register as good & as a Townsfolk or Outsider, even if dead.';

    static getRegisterAs(
        characterSheet: CharacterSheet,
        reason?: string
    ): [typeof Character, Alignment] {
        const options = Generator.chain_from_iterable<typeof Character>([
            characterSheet.townsfolk,
            characterSheet.outsider,
            [Spy],
        ]);
        const characterToRegisterAs: typeof Character =
            GameUI.storytellerChoose(options, reason);

        const alignmentToRegisterAs =
            characterToRegisterAs.characterType.defaultAlignment;
        if (
            alignmentToRegisterAs !== Alignment.Good &&
            alignmentToRegisterAs !== Alignment.Evil
        ) {
            throw new IncorrectAlignmentForSpyToRegisterAs(
                characterToRegisterAs,
                alignmentToRegisterAs
            );
        }

        return [characterToRegisterAs, alignmentToRegisterAs];
    }

    static registerAs(
        spyPlayer: Player,
        characterToRegisterAs: typeof Character,
        alignmentToRegisterAs: Alignment
    ): Player {
        return new Proxy(spyPlayer, {
            get: function (target, property, receiver) {
                switch (property) {
                    case 'character':
                        return characterToRegisterAs;
                    case 'alignment':
                        return alignmentToRegisterAs;
                    default:
                        return Reflect.get(target, property, receiver);
                }
            },
        });
    }

    declare source: Player;

    constructor(spyPlayer: Player) {
        super(spyPlayer, SpyInfluence.description);
    }

    apply(gameInfo: GameInfo, context: InfluenceApplyContext): GameInfo {
        const [characterToRegisterAs, alignmentToRegisterAs] =
            SpyInfluence.getRegisterAs(gameInfo.characterSheet, context.reason);

        const playersAfterReplacement = Array.from(
            gameInfo.players.replace(
                (player) => Object.is(player.character, Spy),
                (player) =>
                    SpyInfluence.registerAs(
                        player,
                        characterToRegisterAs,
                        alignmentToRegisterAs
                    )
            )
        );

        return new GameInfo(playersAfterReplacement, gameInfo.characterSheet);
    }
}
