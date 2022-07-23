import { NoPlayerForCharacterAct } from './exception';
import type { GameInfo as GameState } from './gameinfo';
import { Influence, InfluenceApplyContext as Context } from './influence';
import { Player } from './player';
import { DeadReason } from './deadreason';
import { GameUI } from '~/interaction/gameui';
import { Imp } from '~/content/characters/output/imp';

/**
 * CharacterAct is when a player needs to perform some actions because of character ability. Such actions will usually affect the game.
 */
export abstract class CharacterAct extends Influence {
    playerId?: string;

    static of(player: Player) {
        let characterAct: CharacterAct | undefined;

        switch (player.character) {
            case Imp:
                characterAct = ImpAct.of(player);
                break;
            default:
                break;
        }

        return characterAct;
    }

    constructor(player: Player, description: string) {
        super(player, description);
        this.setPlayer(player);
    }

    abstract canAct(gameState: GameState): boolean;

    abstract _act(gameState: GameState, context: Context): Promise<GameState>;

    async apply(gameInfo: GameState, context: Context): Promise<GameState> {
        return await this.act(gameInfo, context);
    }

    _getPlayer(gameState: GameState): Player | undefined {
        return gameState.getInfluencedPlayer(this.playerId);
    }

    setPlayer(player: Player) {
        this.playerId = player.id;
    }

    async act(gameState: GameState, context: Context): Promise<GameState> {
        if (this.canAct(gameState)) {
            return await this._act(gameState, context);
        } else {
            return gameState;
        }
    }

    protected async getPlayer(gameState: GameState): Promise<Player> {
        const error = new NoPlayerForCharacterAct(this);
        await error.throwWhen(
            (error) => error.characterAct.playerId === undefined
        );

        await error.throwWhen(
            (error) => error.characterAct._getPlayer(gameState) === undefined
        );

        return this._getPlayer(gameState)!;
    }
}

export abstract class NonfirstNightCharacterAct extends CharacterAct {
    canAct(gameState: GameState): boolean {
        return gameState.gamePhase.isNonfirstNight;
    }
}

export class ImpAct extends NonfirstNightCharacterAct {
    static description =
        'The Imp kills a player each night, and can make copies of itself... for a terrible price.';

    static of(player: Player) {
        return new this(player, ImpAct.description);
    }

    choosePlayerToKill(
        impPlayer: Player,
        players: Iterable<Player>
    ): Promise<Player> {
        return GameUI.choose(impPlayer, players, ImpAct.description);
    }

    async _act(gameState: GameState, _context: Context): Promise<GameState> {
        const impPlayer = await this.getPlayer(gameState);
        const chosenPlayer = await this.choosePlayerToKill(
            impPlayer,
            gameState.players
        );
        impPlayer.attack(chosenPlayer);
        return gameState;
    }
}

export class MonkAct extends NonfirstNightCharacterAct {
    static description = 'The Monk protects other players from the Demon.';

    static of(player: Player) {
        return new this(player, MonkAct.description);
    }

    addProtectionToPlayer(player: Player): Player {
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

    choosePlayerToProtect(
        monkPlayer: Player,
        players: Iterable<Player>
    ): Promise<Player> {
        return GameUI.choose(monkPlayer, players, MonkAct.description);
    }

    async _act(gameState: GameState, _context: Context): Promise<GameState> {
        const monkPlayer = await this.getPlayer(gameState);
        const protectedPlayer = await this.choosePlayerToProtect(
            monkPlayer,
            gameState.players
        );
        return gameState.updatePlayer(protectedPlayer, (player) =>
            this.addProtectionToPlayer(player)
        );
    }
}
