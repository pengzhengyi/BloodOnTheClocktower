import { Alignment } from './alignment';
import type { Character } from './character';
import type { CharacterSheet } from './charactersheet';
import { Generator } from './collections';
import { IncorrectAlignmentForSpyToRegisterAs } from './exception';
import { GameInfo } from './gameinfo';
import { Demon } from './charactertype';
import type { Player } from './player';
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

    async apply(
        gameInfo: GameInfo,
        context: InfluenceApplyContext
    ): Promise<GameInfo> {
        return await this._apply(gameInfo, context);
    }

    _apply(_gameInfo: GameInfo, _context: InfluenceApplyContext): GameInfo {
        throw new Error('Method not implemented.');
    }
}

export class Influences extends Influence {
    declare source: Array<Influence>;

    async apply(
        gameInfo: GameInfo,
        context: InfluenceApplyContext
    ): Promise<GameInfo> {
        let influencedGameInfo: GameInfo = gameInfo;

        for (const influence of this.source) {
            influencedGameInfo = await influence.apply(gameInfo, context);
        }

        return influencedGameInfo;
    }
}

export abstract class RegisterAsInfluence extends Influence {
    declare playerToRegister: Player;
    declare static originalCharacter: typeof Character;
    declare static registerAsAlignment: Alignment.Good | Alignment.Evil;

    static async getRegisteredAs(
        characterSheet: CharacterSheet,
        reason?: string
    ): Promise<[typeof Character, Alignment]> {
        const characterToRegisterAs = await this.getRegisterAsCharacter(
            characterSheet,
            reason
        );

        const alignmentToRegisterAs =
            characterToRegisterAs.characterType.defaultAlignment;

        const error = new IncorrectAlignmentForSpyToRegisterAs(
            characterToRegisterAs,
            alignmentToRegisterAs
        );
        await error.throwWhen(
            (error) =>
                error.correctedAlignmentToRegisterAs !== Alignment.Good &&
                error.correctedAlignmentToRegisterAs !== Alignment.Evil
        );

        return [characterToRegisterAs, error.correctedAlignmentToRegisterAs];
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
    ): Promise<typeof Character> {
        const options = this.getRegisterAsCharacterOptions(characterSheet);

        return GameUI.storytellerChoose(options, reason);
    }

    constructor(playerToRegister: Player, description: string) {
        super(playerToRegister, description);
        this.playerToRegister = playerToRegister;
    }

    async apply(
        gameInfo: GameInfo,
        context: InfluenceApplyContext
    ): Promise<GameInfo> {
        const thisClass = this.constructor as typeof RegisterAsInfluence;

        const [characterToRegisterAs, alignmentToRegisterAs] =
            await thisClass.getRegisteredAs(
                gameInfo.characterSheet,
                context.reason
            );

        const playersAfterReplacement = Array.from(
            gameInfo.players.replace(
                (player) => player.equals(this.playerToRegister),
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

export abstract class RegisterAsDemonInfluence extends RegisterAsEvilInfluence {
    static registerAs(player: Player): Player {
        return new Proxy(player, {
            get: function (target, property, receiver) {
                switch (property) {
                    case 'characterType':
                        return Demon;
                    case 'isDemon':
                        return true;
                    default:
                        return Reflect.get(target, property, receiver);
                }
            },
        });
    }

    _apply(gameInfo: GameInfo, _context: InfluenceApplyContext): GameInfo {
        const thisClass = this.constructor as typeof RegisterAsDemonInfluence;

        const playersAfterReplacement = Array.from(
            gameInfo.players.replace(
                (player) => player.equals(this.playerToRegister),
                (player) => thisClass.registerAs(player)
            )
        );

        return new GameInfo(playersAfterReplacement, gameInfo.characterSheet);
    }
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

export class FortuneTellerRedHerringInfluence extends RegisterAsDemonInfluence {
    static readonly description: string =
        'There is a good player that registers as a Demon to the Fortune Teller.';

    constructor(fortuneTellerPlayer: Player, playerAsRedHerring: Player) {
        super(
            fortuneTellerPlayer,
            FortuneTellerRedHerringInfluence.description
        );
        this.playerToRegister = playerAsRedHerring;
    }
}
