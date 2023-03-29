/* eslint-disable no-use-before-define */
import '@abraham/reflection';
import { DeadReason } from '../dead-reason';
import type { IEffectTarget } from '../effect/effect-target';
import { EffectTarget } from '../effect/effect-target';
import type { INomination } from '../nomination';
import { type IPlayer } from '../player/player';
import type { TJSON } from '../types';
import { TAUTOLOGY, type Predicate } from '../types';
import type { Death } from '../death';
import { AttemptMoreThanOneExecution } from '../exception/attempt-more-than-one-execution';
import { NoVotesWhenCountingVote } from '../exception/no-votes-when-counting-vote';
import { NominatedNominatedBefore } from '../exception/nominated-nominated-before';
import { NominatorNominatedBefore } from '../exception/nominator-nominated-before';
import { CannotFindExistingNomination } from '../exception/cannot-find-existing-nomination';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface IExecution extends IEffectTarget<IExecution> {
    readonly nominations: Array<INomination>;

    readonly toExecute: IPlayer | undefined;

    readonly executed: IPlayer | undefined;

    /**
     * {@link `glossary["About to die"]`}
     * @return The player who has enough votes to be executed and more votes than any other player today.
     *
     * @param numAlivePlayer Number of alive players in game.
     */
    getPlayerAboutToDie(numAlivePlayer: number): Promise<IPlayer | undefined>;

    /**
     * Set the player about to die as the one to be executed.
     *
     * @param numAlivePlayer Number of alive players in game.
     */
    setPlayerAboutToDieForExecution(
        numAlivePlayer: number
    ): Promise<IPlayer | undefined>;

    /**
     * Execute the player about to die by default or when another player is provided as alternative, execute that player.
     *
     * @param player A player to be executed. If provided, this player will be executed immediately regardless whether another player is set to be executed. When not provided, the execution will carry out as normal.
     * @returns A death describing the execution effect if someone is executed, undefined when no one is executed.
     */
    execute(
        playerToExecuteInstead?: IPlayer,
        deadReason?: DeadReason
    ): Promise<Death | undefined>;

    addNomination(nomination: INomination): Promise<boolean>;

    toJSON(): TJSON;
}

/**
 * {@link `glossary["Execution"]`}
 * The group decision to kill a player other than a Traveller during the day. There is a maximum of one execution per day, but there may be none. A nominated player is executed if they got votes equal to at least half the number of alive players, and more votes than any other nominated player.
 */
export class Execution extends EffectTarget<IExecution> implements IExecution {
    protected static defaultEnabledProxyHandlerPropertyNames: Array<
        keyof ProxyHandler<Execution>
    > = ['get'];

    static init(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Execution>>
    ) {
        if (enabledProxyHandlerPropertyNames === undefined) {
            enabledProxyHandlerPropertyNames =
                this.defaultEnabledProxyHandlerPropertyNames;
        }

        const execution = new this(enabledProxyHandlerPropertyNames);

        return execution.getProxy();
    }

    readonly nominations: Array<INomination> = [];

    get toExecute(): IPlayer | undefined {
        return this._toExecute;
    }

    get executed(): IPlayer | undefined {
        return this._executed;
    }

    protected readonly pastNominators: Set<IPlayer> = new Set();

    protected readonly pastNominateds: Set<IPlayer> = new Set();

    protected _executed?: IPlayer;

    protected _toExecute?: IPlayer;

    // eslint-disable-next-line no-useless-constructor
    protected constructor(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Execution>>
    ) {
        super(enabledProxyHandlerPropertyNames);
    }

    /**
     * {@link `glossary["About to die"]`}
     * @return The player who has enough votes to be executed and more votes than any other player today.
     *
     * @param numAlivePlayer Number of alive players in game.
     */
    async getPlayerAboutToDie(
        numAlivePlayer: number
    ): Promise<IPlayer | undefined> {
        let highestNumVotes = 0;
        let playerAboutToDie: IPlayer | undefined;

        for (const nomination of this.nominations) {
            try {
                const vote = nomination.vote;

                await new NoVotesWhenCountingVote(vote).throwWhen(
                    (error) => !error.vote.hasVoted
                );

                if (!vote.hasEnoughVote(numAlivePlayer)) {
                    continue;
                }

                const numVotes = vote.votes.length;

                if (numVotes > highestNumVotes) {
                    highestNumVotes = numVotes;
                    playerAboutToDie = nomination.nominated;
                } else if (numVotes === highestNumVotes) {
                    playerAboutToDie = undefined;
                }
            } catch (error) {
                if (error instanceof NoVotesWhenCountingVote) {
                    error.nomination = nomination;
                }

                throw error;
            }
        }

        return playerAboutToDie;
    }

    /**
     * Set the player about to die as the one to be executed.
     *
     * @param numAlivePlayer Number of alive players in game.
     */
    async setPlayerAboutToDieForExecution(
        numAlivePlayer: number
    ): Promise<IPlayer | undefined> {
        const playerAboutToDie = await this.getPlayerAboutToDie(numAlivePlayer);
        this._toExecute = playerAboutToDie;
        return playerAboutToDie;
    }

    /**
     * Execute the player about to die or another player when provided as replacement.
     *
     * @param playerToExecuteInstead A player to be executed. If provided, this player will be executed immediately regardless whether another player is set to be executed. When not provided, the execution will carry out as intended.
     * @returns Whether a player has been executed.
     */
    async execute(
        playerToExecuteInstead?: IPlayer,
        deadReason: DeadReason = DeadReason.Executed
    ): Promise<Death | undefined> {
        if (!this.willExecute(playerToExecuteInstead)) {
            return;
        }

        playerToExecuteInstead ??= this.toExecute;
        if (playerToExecuteInstead === undefined) {
            return;
        }

        return await this.tryExecute(playerToExecuteInstead, deadReason);
    }

    async addNomination(nomination: INomination): Promise<boolean> {
        const checks = await Promise.all([
            this.checkNominatorNotNominatedBefore(nomination),
            this.checkNominatedNotNominatedBefore(nomination),
        ]);

        if (checks.every((check) => check)) {
            this.nominations.push(nomination);

            this.pastNominators.add(nomination.nominator);
            this.pastNominateds.add(nomination.nominated);

            return true;
        }

        return false;
    }

    toJSON(): TJSON {
        return {
            nominations: this.nominations.map((nomination) =>
                nomination.toJSON()
            ),
            toExecute: this.toExecute?.toJSON() ?? null,
            executed: this.executed?.toJSON() ?? null,
        };
    }

    protected willExecute(player?: IPlayer): boolean {
        if (this.executed !== undefined) {
            if (player === undefined && this.toExecute === undefined) {
                return false;
            } else {
                const attemptedToExecute = (player ||
                    this.toExecute) as IPlayer;
                throw new AttemptMoreThanOneExecution(
                    this,
                    this.executed,
                    attemptedToExecute
                );
            }
        }

        return true;
    }

    protected async tryExecute(
        player: IPlayer,
        deadReason: DeadReason
    ): Promise<Death | undefined> {
        if (
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                this.formatPromptForExecutePlayer(player)
            )
        ) {
            this._toExecute = player;
            const executionResult = await player.setDead(deadReason);

            if (executionResult !== undefined) {
                this._executed = player;
                return executionResult;
            }
        }
    }

    protected formatPromptForExecutePlayer(player: IPlayer): string {
        return `Confirm player ${player} will be executed immediately?`;
    }

    protected findPastNomination(
        predicate: Predicate<INomination>
    ): INomination {
        const found = this.nominations.find(predicate);
        if (found === undefined) {
            throw new CannotFindExistingNomination(predicate, this.nominations);
        } else {
            return found;
        }
    }

    private async checkNominatorNotNominatedBefore(
        nomination: INomination
    ): Promise<boolean> {
        const validationSucceed = await NominatorNominatedBefore.ternary(
            () => !this.pastNominators.has(nomination.nominator),
            TAUTOLOGY,
            () => {
                const pastNomination = this.findPastNomination(
                    (pastNomination) =>
                        pastNomination.nominator.equals(nomination.nominator)
                );
                return new NominatorNominatedBefore(
                    nomination,
                    pastNomination,
                    nomination.nominator
                );
            },
            (error) => error.forceAllowNomination
        );

        return validationSucceed;
    }

    private async checkNominatedNotNominatedBefore(
        nomination: INomination
    ): Promise<boolean> {
        const validationSucceed = await NominatedNominatedBefore.ternary(
            () => !this.pastNominateds.has(nomination.nominated),
            TAUTOLOGY,
            () => {
                const pastNomination = this.findPastNomination(
                    (pastNomination) =>
                        pastNomination.nominated.equals(nomination.nominated)
                );
                return new NominatedNominatedBefore(
                    nomination,
                    pastNomination,
                    nomination.nominated
                );
            },
            (error) => error.forceAllowNomination
        );

        return validationSucceed;
    }
}

export function isExecution(value: unknown): value is IExecution {
    return value instanceof Execution;
}
