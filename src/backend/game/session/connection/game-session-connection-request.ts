/**
 * Request to connect to a game session.
 */
export interface IGameSessionConnectionRequest {
    readonly gameSessionId: string;

    readonly data: Map<string, string>;
}
