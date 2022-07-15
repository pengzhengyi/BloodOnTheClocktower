import { Alignment } from './alignment';
import { Character } from './character';
import { CharacterSheet } from './charactersheet';
import { Generator } from './collections';
import { IncorrectAlignmentForSpyToRegisterAs } from './exception';
import { GameInfo } from './gameinfo';
import { Player } from './player';
import { Spy } from '~/content/characters/output/spy';
import { GameUI } from '~/interaction/gameui';
import { Recluse } from '~/content/characters/output/recluse';

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

export abstract class RegisterAsInfluence extends Influence {
    declare static originalCharacter: typeof Character;
    declare static registerAsAlignment: Alignment.Good | Alignment.Evil;

    static getRegisteredAs(
        characterSheet: CharacterSheet,
        reason?: string
    ): [typeof Character, Alignment] {
        const characterToRegisterAs = this.getRegisterAsCharacter(
            characterSheet,
            reason
        );

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
        player: Player,
        characterToRegisterAs: typeof Character,
        alignmentToRegisterAs: Alignment
    ): Player {
        return new Proxy(player, {
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

    protected static getRegisterAsCharacterOptions(
        characterSheet: CharacterSheet
    ): Iterable<typeof Character> {
        const characterOptionIterables =
            this.registerAsAlignment === Alignment.Good
                ? [characterSheet.townsfolk, characterSheet.outsider]
                : [characterSheet.minion, characterSheet.demon];
        characterOptionIterables.push([this.originalCharacter]);

        return Generator.chain_from_iterable<typeof Character>(
            characterOptionIterables
        );
    }

    protected static getRegisterAsCharacter(
        characterSheet: CharacterSheet,
        reason?: string
    ): typeof Character {
        const options = this.getRegisterAsCharacterOptions(characterSheet);

        return GameUI.storytellerChoose(options, reason);
    }

    apply(gameInfo: GameInfo, context: InfluenceApplyContext): GameInfo {
        const thisClass = this.constructor as typeof RegisterAsInfluence;

        const [characterToRegisterAs, alignmentToRegisterAs] =
            thisClass.getRegisteredAs(gameInfo.characterSheet, context.reason);

        const playersAfterReplacement = Array.from(
            gameInfo.players.replace(
                (player) =>
                    Object.is(player.character, thisClass.originalCharacter),
                (player) =>
                    thisClass.registerAs(
                        player,
                        characterToRegisterAs,
                        alignmentToRegisterAs
                    )
            )
        );

        return new GameInfo(playersAfterReplacement, gameInfo.characterSheet);
    }
}

export abstract class RegisterAsGoodInfluence extends RegisterAsInfluence {
    static registerAsAlignment: Alignment.Good = Alignment.Good;
}

export abstract class RegisterAsEvilInfluence extends RegisterAsInfluence {
    static registerAsAlignment: Alignment.Evil = Alignment.Evil;
}

export class SpyInfluence extends RegisterAsGoodInfluence {
    static readonly description: string =
        'The Spy might appear to be a good character, but is actually evil. The Spy might register as good & as a Townsfolk or Outsider, even if dead.';

    static originalCharacter: typeof Character = Spy;

    declare source: Player;

    constructor(spyPlayer: Player) {
        super(spyPlayer, SpyInfluence.description);
    }
}

export class RecluseInfluence extends RegisterAsGoodInfluence {
    static readonly description: string =
        'The Recluse might appear to be an evil character, but is actually good. The Recluse might register as evil & as a Minion or Demon, even if dead.';

    static originalCharacter: typeof Character = Recluse;

    declare source: Player;

    constructor(reclusePlayer: Player) {
        super(reclusePlayer, RecluseInfluence.description);
    }
}
