/** @deprecated */
import { DeadReason } from './deadreason';
import { Phase } from './gamephase';
import { Influence } from './influence';
import { Context } from './infoprocessor';
import { Player } from './player';
import { NoPlayerForCharacterAct } from './exception';
import type { GameInfo as GameState } from './gameinfo';
import type { CharacterToken } from './character';
import { GAME_UI } from '~/interaction/gameui';
import { Imp } from '~/content/characters/output/imp';
import { Slayer } from '~/content/characters/output/slayer';

/**
 * CharacterAct is when a player needs to perform some actions because of character ability. Such actions will usually affect the game.
 */
export abstract class CharacterAct extends Influence {
    static from(character: CharacterToken) {
        switch (character) {
            case Imp:
                return [ImpAct];
            case Slayer:
                return [SlayerAct];
            default:
                return [];
        }
    }

    static fromPlayer(player: Player): Array<CharacterAct> {
        const characterActClasses = this.from(player.character);
        return characterActClasses.map((characterActClass) =>
            characterActClass.of(player)
        );
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
        return GAME_UI.choose(
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
        return GAME_UI.choose(
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
