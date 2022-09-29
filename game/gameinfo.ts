import { Players } from './players';
import type { CharacterSheet } from './charactersheet';
import { Player } from './player';
import { Seating } from './seating';
import type { Execution } from './execution';
import { CannotFindPlayerInGame } from './exception';
import { Generator } from './collections';
import type { GamePhase } from './gamephase';
import { Transform } from './types';
import { Game } from './game';

type UnderlyingPlayers = Array<Player>;

export class GameInfo {
    execution?: Execution;

    characterSheet: CharacterSheet;

    readonly gamePhase: GamePhase;

    readonly game: Game;

    protected readonly playerIdToInfluencedPlayer: Map<string, Player>;

    private _players: UnderlyingPlayers;

    get players(): Players {
        return new Players(this._players, [], false);
    }

    get executed(): Player | undefined {
        const player = this.execution?.executed;
        if (player !== undefined) {
            return this._getPlayer(player);
        }

        return player;
    }

    constructor(
        players: UnderlyingPlayers,
        characterSheet: CharacterSheet,
        gamePhase: GamePhase,
        game: Game,
        execution?: Execution
    ) {
        this._players = players;
        this.characterSheet = characterSheet;
        this.playerIdToInfluencedPlayer = new Map(
            Generator.map((player) => [player.id, player], players)
        );
        this.gamePhase = gamePhase;
        this.game = game;
        this.execution = execution;
    }

    getSeating(): Promise<Seating> {
        return Seating.from(this._players);
    }

    async getPlayer(player: string | Player | undefined): Promise<Player> {
        let influencedPlayer = this._getPlayer(player);

        if (influencedPlayer === undefined) {
            const error = new CannotFindPlayerInGame(player, this);
            await error.throwWhen(
                (error) => error.matchingPlayer === undefined
            );
            influencedPlayer = error.matchingPlayer;
        }

        return influencedPlayer;
    }

    _getPlayer(player: string | Player | undefined): Player | undefined {
        if (player === undefined) {
            return undefined;
        }

        if (player instanceof Player) {
            return this.playerIdToInfluencedPlayer.get(player.id);
        } else {
            return this.playerIdToInfluencedPlayer.get(player);
        }
    }

    async isPlayerAlive(player: string | Player | undefined): Promise<boolean> {
        const influencedPlayer = await this.getPlayer(player);
        return influencedPlayer.alive;
    }

    replace(
        changes: Partial<{
            players: UnderlyingPlayers;
            characterSheet: CharacterSheet;
            gamePhase: GamePhase;
            game: Game;
            execution?: Execution;
        }>
    ) {
        const args = Object.assign(
            {},
            {
                execution: this.execution,
                characterSheet: this.characterSheet,
                gamePhase: this.gamePhase,
                game: this.game,
                players: this._players,
            },
            changes
        );
        return new GameInfo(
            args.players,
            args.characterSheet,
            args.gamePhase,
            args.game,
            args.execution
        );
    }

    updatePlayer(original: Player, updateFunction: Transform<Player>) {
        const updatedPlayers = Array.from(
            this.players.replace(
                (player) => player.equals(original),
                updateFunction
            )
        );

        return this.replace({ players: updatedPlayers });
    }
}