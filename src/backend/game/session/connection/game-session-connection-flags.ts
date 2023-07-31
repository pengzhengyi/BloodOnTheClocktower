/**
 * The supported types of connections to a game session.
 */
export enum GameSessionConnectionFlag {
    ConnectionString = 0b1,

    PasswordRequired = 0b10,
}
