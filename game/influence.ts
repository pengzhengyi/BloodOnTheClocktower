/** @deprecated */

import { Alignment } from './alignment';
import type { CharacterToken } from './character';
import type { CharacterSheet } from './charactersheet';
import { Generator } from './collections';
import { IncorrectAlignmentForSpyToRegisterAs } from './exception';
import type { GameInfo } from './gameinfo';
import { Demon } from './charactertype';
import type { Player } from './player';
import { DeadReason } from './deadreason';
import type { Context, InfoProcessor } from './infoprocessor';
import { Phase } from './gamephase';
import { Spy } from '~/content/characters/output/spy';
import { GAME_UI } from '~/interaction/gameui';
import { Recluse } from '~/content/characters/output/recluse';

/**
 * Influence is usually some passive impact caused by character's ability.
 */
export abstract class Influence implements InfoProcessor {
    static immuneFromDemonAttack(player: Player): Player {
        return new Proxy(player, {
            get: function (target, property, receiver) {
                const original = Reflect.get(target, property, receiver);

                switch (property) {
                    case 'setDead':
                        return (reason: DeadReason) => {
                            if (reason === DeadReason.DemonAttack) {
                                return;
                            }

                            return original(reason);
                        };
                    default:
                        return original;
                }
            },
        });
    }

    abstract applicablePhases: Phase;

    constructor(readonly source: unknown, readonly description: string) {
        this.source = source;
        this.description = description;
    }

    async apply(gameInfo: GameInfo, context: Context): Promise<GameInfo> {
        if (await this.isEligible(gameInfo)) {
            return await this._apply(gameInfo, context);
        } else {
            return gameInfo;
        }
    }

    _apply(_gameInfo: GameInfo, _context: Context): Promise<GameInfo> {
        throw new Error('Method not implemented.');
    }

    async isEligible(_gameState: GameInfo): Promise<boolean> {
        return await true;
    }
}

export abstract class RegisterAsInfluence extends Influence {
    declare playerToRegister: Player;
    declare static originalCharacter: CharacterToken;
    declare static registerAsAlignment: Alignment.Good | Alignment.Evil;

    static async getRegisteredAs(
        characterSheet: CharacterSheet,
        reason?: string
    ): Promise<[CharacterToken, Alignment]> {
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
        characterToRegisterAs: CharacterToken,
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
    ): Iterable<CharacterToken> {
        const characterOptionIterables =
            this.registerAsAlignment === Alignment.Good
                ? [characterSheet.townsfolk, characterSheet.outsider]
                : [characterSheet.minion, characterSheet.demon];
        characterOptionIterables.push([this.originalCharacter]);

        return Generator.chain_from_iterable<CharacterToken>(
            characterOptionIterables
        );
    }

    protected static getRegisterAsCharacter(
        characterSheet: CharacterSheet,
        reason?: string
    ): Promise<CharacterToken> {
        const options = this.getRegisterAsCharacterOptions(characterSheet);

        return GAME_UI.storytellerChooseOne(options, reason);
    }

    constructor(playerToRegister: Player, description: string) {
        super(playerToRegister, description);
        this.playerToRegister = playerToRegister;
    }

    async apply(gameInfo: GameInfo, context: Context): Promise<GameInfo> {
        const thisClass = this.constructor as typeof RegisterAsInfluence;

        const [characterToRegisterAs, alignmentToRegisterAs] =
            await thisClass.getRegisteredAs(
                gameInfo.characterSheet,
                context.reason
            );

        return gameInfo.updatePlayer(this.playerToRegister, (player) =>
            thisClass.registerAs(
                player,
                characterToRegisterAs,
                alignmentToRegisterAs
            )
        );
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

    async _apply(gameInfo: GameInfo, _context: Context) {
        const thisClass = this.constructor as typeof RegisterAsDemonInfluence;

        return await gameInfo.updatePlayer(this.playerToRegister, (player) =>
            thisClass.registerAs(player)
        );
    }
}

export class SpyInfluence extends RegisterAsGoodInfluence {
    static readonly description: string =
        'The Spy might appear to be a good character, but is actually evil. The Spy might register as good & as a Townsfolk or Outsider, even if dead.';

    static originalCharacter: CharacterToken = Spy;

    declare source: Player;

    applicablePhases = Phase.__ALL__;

    constructor(spyPlayer: Player) {
        super(spyPlayer, SpyInfluence.description);
    }
}

export class RecluseInfluence extends RegisterAsGoodInfluence {
    static readonly description: string =
        'The Recluse might appear to be an evil character, but is actually good. The Recluse might register as evil & as a Minion or Demon, even if dead.';

    static originalCharacter: CharacterToken = Recluse;

    declare source: Player;

    applicablePhases = Phase.__ALL__;

    constructor(reclusePlayer: Player) {
        super(reclusePlayer, RecluseInfluence.description);
    }
}

export class MayorDieInsteadInfluence extends Influence {
    static readonly description: string =
        'If mayor die at night, another player might die instead.';

    declare source: Player;

    applicablePhases = Phase.Night;

    constructor(mayorPlayer: Player) {
        super(mayorPlayer, MayorDieInsteadInfluence.description);
    }

    choosePlayerToDieInstead(players: Iterable<Player>): Promise<Player> {
        return GAME_UI.storytellerChooseOne(
            players,
            MayorDieInsteadInfluence.description
        );
    }

    async isEligible(gameInfo: GameInfo) {
        return await gameInfo.gamePhase.isNight;
    }

    addInfluenceToMayor(gameInfo: GameInfo, mayorPlayer: Player): Player {
        const self = this;

        return new Proxy(mayorPlayer, {
            get: function (target, property, receiver) {
                const original = Reflect.get(target, property, receiver);

                switch (property) {
                    case 'setDead':
                        return async (reason: DeadReason) => {
                            if (await self.isEligible(gameInfo)) {
                                const chosen =
                                    await self.choosePlayerToDieInstead(
                                        gameInfo.players
                                    );
                                await chosen.setDead(reason);
                                return;
                            }

                            return await original(reason);
                        };
                    default:
                        return original;
                }
            },
        });
    }

    async _apply(gameInfo: GameInfo, _context: Context) {
        return await gameInfo.updatePlayer(this.source, (player) =>
            this.addInfluenceToMayor(gameInfo, player)
        );
    }
}

export class MayorPeacefulWinInfluence extends Influence {
    static readonly description: string =
        'If only 3 players live & no execution occurs, good wins.';

    declare source: Player;

    applicablePhases = Phase.Day;

    constructor(mayorPlayer: Player) {
        super(mayorPlayer, MayorPeacefulWinInfluence.description);
    }

    async isEligible(gameInfo: GameInfo) {
        return (
            (await gameInfo.executed) === undefined &&
            gameInfo.players.filter((player) => player.alive).count() === 3
        );
    }

    async apply(gameInfo: GameInfo, _context: Context): Promise<GameInfo> {
        if (await this.isEligible(gameInfo)) {
            await gameInfo.game.setWinningTeam(Alignment.Good);
        }

        return gameInfo;
    }
}
