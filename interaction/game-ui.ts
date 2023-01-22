import { ICallForNomination } from './call-for-nomination';
import { IChoose } from './choose';
import { IConfirm } from './confirm';
import { IHandle } from './handle';
import { ISend } from './send';
import { IStorytellerChoose } from './storyteller-choose';
import { IStorytellerChooseOne } from './storyteller-choose-one';
import { IStorytellerConfirm } from './storyteller-confirm';
import { IStorytellerDecide } from './storyteller-decide';
import type { IHasRaisedHandForVote } from './has-raised-hand-for-vote';
import type { IPlayer } from '~/game/player';
import type { StaticThis } from '~/game/types';

export type IGameUIInteractions = [
    IHasRaisedHandForVote,
    IHandle,
    IChoose,
    IStorytellerChoose,
    IStorytellerChooseOne,
    IStorytellerDecide,
    IConfirm,
    IStorytellerConfirm,
    ISend,
    ICallForNomination
];

/**
 * Abstraction for necessary interaction with players.
 *
 * Also can be viewed as a game server.
 */
export interface IGameUI
    extends IHasRaisedHandForVote,
        IHandle,
        IChoose,
        IStorytellerChoose,
        IStorytellerChooseOne,
        IStorytellerDecide,
        IConfirm,
        IStorytellerConfirm,
        ISend,
        ICallForNomination {}

export type IGameUIInteraction = IGameUIInteractions[number];

export interface IGameUIFactory {
    instance?: IGameUI;

    init<TArgs extends any[]>(
        this: StaticThis<IGameUI>,
        ...args: TArgs
    ): IGameUI;
}

export interface IGameUIProvider {
    gameUI: IGameUI;
}

abstract class AbstractGameUI implements IGameUI {
    protected static instance?: IGameUI;

    static getInstance<TGameUI extends AbstractGameUI>(
        this: StaticThis<TGameUI> & IGameUIFactory
    ): IGameUI {
        if (this.instance === undefined) {
            this.instance = this.init();
        }

        return this.instance;
    }

    static init<TGameUI extends AbstractGameUI>(
        this: StaticThis<TGameUI>
    ): TGameUI {
        return new this();
    }

    providers: Map<keyof IGameUI, IGameUIInteraction> = new Map();

    hasRaisedHandForVote(
        ...args: Parameters<IHasRaisedHandForVote['hasRaisedHandForVote']>
    ): ReturnType<IHasRaisedHandForVote['hasRaisedHandForVote']> {
        return this.tryUseProvider<IHasRaisedHandForVote>(
            'hasRaisedHandForVote',
            args
        );
    }

    handle(
        ...args: Parameters<IHandle['handle']>
    ): ReturnType<IHandle['handle']> {
        return this.tryUseProvider<IHandle>('handle', args);
    }

    choose<T>(
        ...args: [
            IPlayer,
            Iterable<T>,
            number | undefined,
            string | undefined,
            number | undefined
        ]
    ): Promise<T> | Promise<T[]> {
        return this.tryUseProvider<IChoose>('choose', args);
    }

    storytellerChoose<T>(
        ...args: [
            Iterable<T>,
            number | undefined,
            string | undefined,
            boolean | undefined,
            T | Iterable<T> | undefined,
            number | undefined
        ]
    ): Promise<T> | Promise<T[]> | Promise<undefined> {
        return this.tryUseProvider<IStorytellerChoose>(
            'storytellerChoose',
            args
        );
    }

    storytellerChooseOne<T>(
        ...args: [
            Iterable<T>,
            string | undefined,
            T | undefined,
            number | undefined
        ]
    ): Promise<T> {
        return this.tryUseProvider<IStorytellerChooseOne>(
            'storytellerChooseOne',
            args
        );
    }

    storytellerDecide<T>(
        ...args: [string | undefined, boolean | undefined, number | undefined]
    ): Promise<T> | Promise<undefined> {
        return this.tryUseProvider<IStorytellerDecide>(
            'storytellerDecide',
            args
        );
    }

    confirm(
        ...args: Parameters<IConfirm['confirm']>
    ): ReturnType<IConfirm['confirm']> {
        return this.tryUseProvider<IConfirm>('confirm', args);
    }

    storytellerConfirm(
        ...args: Parameters<IStorytellerConfirm['storytellerConfirm']>
    ): ReturnType<IStorytellerConfirm['storytellerConfirm']> {
        return this.tryUseProvider<IStorytellerConfirm>(
            'storytellerConfirm',
            args
        );
    }

    send<T>(
        ...args: [IPlayer, T, string | undefined, number | undefined]
    ): Promise<void> {
        return this.tryUseProvider<ISend>('send', args);
    }

    callForNomination(
        ...args: Parameters<ICallForNomination['callForNomination']>
    ): ReturnType<ICallForNomination['callForNomination']> {
        return this.tryUseProvider<ICallForNomination>(
            'callForNomination',
            args
        );
    }

    protected tryUseProvider<
        TProvider extends IGameUIInteraction,
        TArgs extends any[] = any[],
        TResult = any
    >(interaction: keyof TProvider & keyof IGameUI, args: TArgs): TResult {
        const provider = this.providers.get(interaction) as
            | TProvider
            | undefined;

        if (provider === undefined) {
            throw new Error('Method not implemented.');
        }

        const implementation = provider[interaction] as (
            ...args: TArgs
        ) => TResult;

        return implementation(...args);
    }
}

/**
 * Abstraction for necessary interaction with players.
 *
 * Also can be viewed as a game server.
 *
 */
export class GameUI extends AbstractGameUI {}
