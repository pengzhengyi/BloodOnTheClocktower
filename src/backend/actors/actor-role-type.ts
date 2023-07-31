/**
 * Actor role type represents the eligibility that authorizes an actor to perform certain activities.
 *
 * For example, Developer is an actor eligibility that authorizes an actor to perform developer activities like entering developer mode to view debugging logs.
 *
 * An actor can assume multiple roles. For example, an actor can be both a User, a Game Session Host and a Developer.
 */
export enum ActorRoleType {
    Default = 'default',
    User = 'user',
    Developer = 'developer',
    Admin = 'admin',

    GameSessionHost = 'game session host',
    GameSessionGuest = 'game session guest',
}
