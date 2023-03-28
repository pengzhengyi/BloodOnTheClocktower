/* eslint-disable no-use-before-define */
import '@abraham/reflection';
import { Exclude, Expose, instanceToPlain, Type } from 'class-transformer';
import { DeadReason } from '../dead-reason';
import { EffectTarget } from '../effect/effect-target';
import type { INomination } from '../nomination';
import { Nomination } from '../nomination';
import { type IPlayer, Player } from '../player';
import { type Predicate } from '../types';
import type { Death } from '../death';
import { AttemptMoreThanOneExecution } from '../exception/attempt-more-than-one-execution';
import { NoVotesWhenCountingVote } from '../exception/no-votes-when-counting-vote';
import { NominatedNominatedBefore } from '../exception/nominated-nominated-before';
import { NominatorNominatedBefore } from '../exception/nominator-nominated-before';
import { InteractionEnvironment } from '~/interaction/environment/environment';

/**
 * {@link `glossary["Execution"]`}
 * The group decision to kill a player other than a Traveller during the day. There is a maximum of one execution per day, but there may be none. A nominated player is executed if they got votes equal to at least half the number of alive players, and more votes than any other nominated player.
 */
@Exclude()
export class Execution extends EffectTarget<Execution> {
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

    @Expose({ toPlainOnly: true })
    @Type(() => Nomination)
    readonly nominations: Array<INomination> = [];

    @Expose({ toPlainOnly: true })
    @Type(() => Player)
    get toExecute(): IPlayer | undefined {
        return this._toExecute;
    }

    @Expose({ toPlainOnly: true })
    @Type(() => Player)
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
     * Set the player about to die as the one to be executed.
     *
     * @param numAlivePlayer Number of alive players in game.
     */
    async setPlayerAboutToDie(
        numAlivePlayer: number
    ): Promise<IPlayer | undefined> {
        const playerAboutToDie = await this.getPlayerAboutToDie(numAlivePlayer);
        this._toExecute = playerAboutToDie;
        return playerAboutToDie;
    }

    /**
     * Execute the player about to die or another player when provided as replacement.
     *
     * @param player A player to be executed. If provided, this player will be executed immediately regardless whether another player is set to be executed. When not provided, the execution will carry out as intended.
     * @returns Whether a player has been executed.
     */
    async execute(
        player?: IPlayer,
        deadReason: DeadReason = DeadReason.Executed
    ): Promise<Death | undefined> {
        if (!this.willExecute(player)) {
            return;
        }

        player ??= this.toExecute;
        if (player === undefined) {
            return;
        }

        return await this.tryExecute(player, deadReason);
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

    getPastNomination(
        predicate: Predicate<INomination>
    ): INomination | undefined {
        return this.nominations.find(predicate);
    }

    toJSON() {
        return instanceToPlain(this);
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

    private async checkNominatorNotNominatedBefore(
        nomination: INomination
    ): Promise<boolean> {
        if (this.pastNominators.has(nomination.nominator)) {
            const pastNomination = this.getPastNomination((pastNomination) =>
                pastNomination.nominator.equals(nomination.nominator)
            )!;
            const error = new NominatorNominatedBefore(
                nomination,
                pastNomination,
                nomination.nominator
            );
            await error.resolve();
            return error.forceAllowNomination;
        }

        return true;
    }

    private async checkNominatedNotNominatedBefore(
        nomination: INomination
    ): Promise<boolean> {
        if (this.pastNominateds.has(nomination.nominated)) {
            const pastNomination = this.getPastNomination((pastNomination) =>
                pastNomination.nominated.equals(nomination.nominated)
            )!;
            const error = new NominatedNominatedBefore(
                nomination,
                pastNomination,
                nomination.nominated
            );
            await error.resolve();
            return error.forceAllowNomination;
        }

        return true;
    }
}
