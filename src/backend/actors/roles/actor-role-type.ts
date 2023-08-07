/**
 * Actor role type represents the eligibility that authorizes an actor to perform certain activities.
 *
 * For example, Developer is an actor eligibility that authorizes an actor to perform developer activities like entering developer mode to view debugging logs.
 *
 * An actor can assume multiple roles. For example, an actor can be both a User, a Game Session Host and a Developer.
 */
export enum ActorRoleType {
    /**
     * The initial status of an actor before it is authenticated as an admin or become an anonymous user.
     */
    Unset = 'unset',

    AnonymousUser = 'anonymous user',
    User = 'user',
    Admin = 'admin',

    Developer = 'developer',

    GameSessionHost = 'game session host',
    GameSessionGuest = 'game session guest',
}
