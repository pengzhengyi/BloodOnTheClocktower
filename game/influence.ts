import { Alignment } from './alignment';
import type { Character } from './character';
import type { CharacterSheet } from './charactersheet';
import { Generator } from './collections';
import { IncorrectAlignmentForSpyToRegisterAs } from './exception';
import type { GameInfo } from './gameinfo';
import { Demon } from './charactertype';
import type { Player } from './player';
import { DeadReason } from './deadreason';
import type { Context, InfoProcessor } from './infoprocessor';
import type { Nomination } from './nomination';
import { GamePhase } from './gamephase';
import type { Execution } from './execution';
import { Spy } from '~/content/characters/output/spy';
import { GameUI } from '~/interaction/gameui';
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

    _apply(_gameInfo: GameInfo, _context: Context): GameInfo {
        throw new Error('Method not implemented.');
    }

    async isEligible(_gameState: GameInfo): Promise<boolean> {
        return await true;
    }
}

export class Influences extends Influence {
    declare source: Array<Influence>;

    async apply(gameInfo: GameInfo, context: Context): Promise<GameInfo> {
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

    _apply(gameInfo: GameInfo, _context: Context): GameInfo {
        const thisClass = this.constructor as typeof RegisterAsDemonInfluence;

        return gameInfo.updatePlayer(this.playerToRegister, (player) =>
            thisClass.registerAs(player)
        );
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

export class VirginInfluence extends Influence {
    static readonly description: string =
        'The 1st time virgin is nominated, if the nominator is a Townsfolk, they are executed immediately.';

    declare source: Player;

    hasBeenNominated = false;

    constructor(virginPlayer: Player) {
        super(virginPlayer, VirginInfluence.description);
    }

    addPenaltyToNominator(
        execution: Execution,
        gamePhase: GamePhase
    ): Execution {
        const proxyExecution = new Proxy(execution, {
            get: function (target, property, receiver) {
                const original = Reflect.get(target, property, receiver);

                switch (property) {
                    case 'addNomination':
                        return async (nomination: Nomination) => {
                            if (await original(nomination)) {
                                if (nomination.nominator.isTownsfolk) {
                                    (await proxyExecution.executeImmediately(
                                        nomination.nominator
                                    )) &&
                                        (await gamePhase.forceTransition(
                                            VirginInfluence.description
                                        ));
                                }

                                return true;
                            }
                            return false;
                        };
                    default:
                        return original;
                }
            },
        });

        return proxyExecution;
    }

    async isEligible(_gameInfo: GameInfo) {
        return await !this.hasBeenNominated;
    }
}

export class SoldierInfluence extends Influence {
    static readonly description: string = 'Soldier is safe from the Demon.';

    declare source: Player;

    constructor(soldierPlayer: Player) {
        super(soldierPlayer, SoldierInfluence.description);
    }

    _apply(gameInfo: GameInfo, _context: Context): GameInfo {
        return gameInfo.updatePlayer(this.source, (player) =>
            Influence.immuneFromDemonAttack(player)
        );
    }
}

export class MayorDieInsteadInfluence extends Influence {
    static readonly description: string =
        'If mayor die at night, another player might die instead.';

    declare source: Player;

    constructor(mayorPlayer: Player) {
        super(mayorPlayer, MayorDieInsteadInfluence.description);
    }

    choosePlayerToDieInstead(players: Iterable<Player>): Promise<Player> {
        return GameUI.storytellerChoose(
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

    _apply(gameInfo: GameInfo, _context: Context): GameInfo {
        return gameInfo.updatePlayer(this.source, (player) =>
            this.addInfluenceToMayor(gameInfo, player)
        );
    }
}

export class MayorPeacefulWinInfluence extends Influence {
    static readonly description: string =
        'If only 3 players live & no execution occurs, good wins.';

    declare source: Player;

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
