import {
    FortuneTellerChooseInvalidPlayers,
    NoPlayerForCharacterAct,
} from './exception';
import type { GameInfo as GameState } from './gameinfo';
import type { FortuneTellerInfoRequester } from './info';
import { Influence } from './influence';
import { Player } from './player';
import { DeadReason } from './deadreason';
import { Character } from './character';
import { Context } from './infoprocessor';
import { Phase } from './gamephase';
import { GameUI } from '~/interaction/gameui';
import { Imp } from '~/content/characters/output/imp';
import { Monk } from '~/content/characters/output/monk';
import { Slayer } from '~/content/characters/output/slayer';
import { Fortuneteller } from '~/content/characters/output/fortuneteller';

/**
 * CharacterAct is when a player needs to perform some actions because of character ability. Such actions will usually affect the game.
 */
export abstract class CharacterAct extends Influence {
    static from(character: typeof Character) {
        switch (character) {
            case Imp:
                return ImpAct;
            case Monk:
                return MonkAct;
            case Slayer:
                return SlayerAct;
            case Fortuneteller:
                return FortuneTellerAct;
            default:
                return undefined;
        }
    }

    static of(player: Player) {
        const characterAct = this.from(player.character);
        return characterAct?.of(player);
    }

    playerId?: string;

    constructor(player: Player, description: string) {
        super(player, description);
        this.setPlayer(player);
    }

    abstract act(gameState: GameState, context: Context): Promise<GameState>;

    _apply(gameInfo: GameState, context: Context): Promise<GameState> {
        return this.act(gameInfo, context);
    }

    _getPlayer(gameState: GameState): Player | undefined {
        return gameState._getPlayer(this.playerId);
    }

    setPlayer(player: Player) {
        this.playerId = player.id;
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
    hasActed = false;

    async isEligible(_gameState: GameState): Promise<boolean> {
        return await !this.hasActed;
    }

    async act(gameState: GameState, _context: Context): Promise<GameState> {
        this.hasActed = true;

        return await gameState;
    }
}

export abstract class OnceCharacterAct extends CharacterAct {
    async isEligible(gameState: GameState) {
        return await gameState.gamePhase.isNonfirstNight;
    }
}

export class ImpAct extends NonfirstNightCharacterAct {
    static description =
        'The Imp kills a player each night, and can make copies of itself... for a terrible price.';

    static of(player: Player) {
        return new this(player, ImpAct.description);
    }

    applicablePhases = Phase.Night;

    choosePlayerToKill(impPlayer: Player, players: Iterable<Player>) {
        return GameUI.choose(
            impPlayer,
            players,
            1,
            ImpAct.description
        ) as Promise<Player>;
    }

    async act(gameState: GameState, _context: Context): Promise<GameState> {
        const impPlayer = await this.getPlayer(gameState);
        const chosenPlayer = await this.choosePlayerToKill(
            impPlayer,
            gameState.players
        );
        await impPlayer.attack(chosenPlayer);
        return gameState;
    }
}

export class MonkAct extends NonfirstNightCharacterAct {
    static description = 'The Monk protects other players from the Demon.';

    static of(player: Player) {
        return new this(player, MonkAct.description);
    }

    applicablePhases = Phase.Night;

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

    choosePlayerToProtect(monkPlayer: Player, players: Iterable<Player>) {
        return GameUI.choose(
            monkPlayer,
            players,
            1,
            MonkAct.description
        ) as Promise<Player>;
    }

    async act(gameState: GameState, _context: Context): Promise<GameState> {
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

export class FortuneTellerAct extends CharacterAct {
    static description =
        'The Fortune Teller detects who the Demon is, but sometimes thinks good players are Demons.';

    static of(player: Player) {
        return new this(player, FortuneTellerAct.description);
    }

    static isChoiceValid(players: Array<Player> | undefined): boolean {
        return Array.isArray(players) && players.length === 2;
    }

    applicablePhases = Phase.Night;

    async isEligible(gameState: GameState): Promise<boolean> {
        return (
            gameState.gamePhase.isNight &&
            (await this.getPlayer(gameState)).alive
        );
    }

    async choosePlayers(
        fortuneTellerPlayer: Player,
        players: Iterable<Player>
    ): Promise<[Player, Player] | undefined> {
        let chosen = (await GameUI.choose(
            fortuneTellerPlayer,
            players,
            2,
            FortuneTellerAct.description
        )) as Array<Player> | undefined;

        if (!FortuneTellerAct.isChoiceValid(chosen)) {
            const error = new FortuneTellerChooseInvalidPlayers(chosen);
            await error.resolve();
            chosen = error.corrected;
        }

        return chosen as [Player, Player] | undefined;
    }

    async act(gameState: GameState, _context: Context): Promise<GameState> {
        const fortuneTellerPlayer = await this.getPlayer(gameState);
        const chosen = await this.choosePlayers(
            fortuneTellerPlayer,
            gameState.players
        );
        (
            fortuneTellerPlayer.infoRequester as FortuneTellerInfoRequester
        ).setChosenPlayers(chosen);
        return gameState;
    }
}

export class SlayerAct extends NonfirstNightCharacterAct {
    static description =
        'The Slayer can kill the Demon by guessing who they are.';

    static of(player: Player) {
        return new this(player, SlayerAct.description);
    }

    applicablePhases = Phase.Day;

    async isEligible(gameState: GameState): Promise<boolean> {
        return (await super.isEligible(gameState)) && gameState.gamePhase.isDay;
    }

    async killDemon(player: Player) {
        if (player.isTheDemon) {
            await player.setDead(DeadReason.SlayerKill);
        }
    }

    chooseSuspectedDemon(slayerPlayer: Player, players: Iterable<Player>) {
        return GameUI.choose(
            slayerPlayer,
            players,
            1,
            SlayerAct.description
        ) as Promise<Player>;
    }

    async act(gameState: GameState, _context: Context): Promise<GameState> {
        gameState = await super.act(gameState, _context);

        const slayerPlayer = await this.getPlayer(gameState);
        const suspectedDemon = await this.chooseSuspectedDemon(
            slayerPlayer,
            gameState.players
        );

        await this.killDemon(suspectedDemon);

        return gameState;
    }
}