import type { ResolveCallback } from '../types';

export interface IEvent {
    toString(): string;
}

export interface IEventCategory {
    has(event: IEvent): boolean;
}

export interface IBlockingSubscriber<TEvent extends IEvent = IEvent> {
    blocking: true;

    notify(event: TEvent, notifyNext: ResolveCallback<void>): void;
}

export interface INonBlockingSubscriber<TEvent extends IEvent = IEvent> {
    blocking: false;

    notify(event: TEvent): void;
}

export type ISubscriber<TEvent extends IEvent = IEvent> =
    | IBlockingSubscriber<TEvent>
    | INonBlockingSubscriber<TEvent>;

export interface INotification<
    TEventCategory extends IEventCategory = IEventCategory
> {
    subscribe<TEvent extends IEvent = IEvent>(
        eventCategory: TEventCategory,
        subscriber: ISubscriber<TEvent>,
        priority?: number
    ): void;

    unsubscribe<TEvent extends IEvent = IEvent>(
        eventCategory: TEventCategory,
        subscriber: ISubscriber<TEvent>
    ): void;

    notify<TEvent extends IEvent = IEvent>(event: TEvent): Promise<void>;
}
