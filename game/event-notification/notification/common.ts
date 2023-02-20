import { OrderedMap } from 'js-sdsl';
import type {
    IBlockingSubscriber,
    IEvent,
    IEventCategory,
    INonBlockingSubscriber,
    INotification,
    ISubscriber,
} from '../types';
import { LazyMap, Generator } from '~/game/collections';
import type { ResolveCallback } from '~/game/types';

export abstract class AbstractNotification<
    TEventCategory extends IEventCategory = IEventCategory
> implements INotification<TEventCategory>
{
    /**
     * When a priority for a subscriber is not provided, this value will be used. Could be any arbitrary small value, chosen `Number.MIN_SAFE_INTEGER + 1` to allow `Number.MIN_SAFE_INTEGER` to be set for subscribers that need to have lower priority than default.
     */
    readonly defaultPriorityWhenNotProvided: number =
        Number.MIN_SAFE_INTEGER + 1;

    abstract readonly eventCategories: Iterable<TEventCategory>;

    protected subscribers: LazyMap<
        TEventCategory,
        OrderedMap<number, Set<ISubscriber<IEvent>>>
    > = new LazyMap(
        (_key) =>
            new OrderedMap(
                undefined,
                (priority, otherPriority) => otherPriority - priority
            )
    );

    protected subscriberToPriority: LazyMap<
        TEventCategory,
        Map<ISubscriber<IEvent>, number>
    > = new LazyMap((_key) => new Map());

    subscribe<TEvent extends IEvent = IEvent>(
        eventCategory: TEventCategory,
        subscriber: ISubscriber<TEvent>,
        priority?: number | undefined
    ): void {
        const priorityToSubscribers = this.subscribers.get(eventCategory);

        const actualPriority = priority ?? this.defaultPriorityWhenNotProvided;
        let subscribers = priorityToSubscribers.getElementByKey(actualPriority);

        if (subscribers === undefined) {
            subscribers = new Set();
            priorityToSubscribers.setElement(actualPriority, subscribers);
        }

        subscribers.add(subscriber);
        this.subscriberToPriority
            .get(eventCategory)
            .set(subscriber, actualPriority);
    }

    unsubscribe<TEvent extends IEvent = IEvent>(
        eventCategory: TEventCategory,
        subscriber: ISubscriber<TEvent>
    ): boolean {
        const priority = this.subscriberToPriority
            .get(eventCategory)
            .get(subscriber);

        if (priority === undefined) {
            return false;
        }

        const priorityToSubscribers = this.subscribers.get(eventCategory);
        const subscribers = priorityToSubscribers.getElementByKey(priority);

        if (subscribers === undefined) {
            // TODO throw an exception here
            return false;
        }

        subscribers.delete(subscriber);
        return true;
    }

    async notify<TEvent extends IEvent = IEvent>(event: TEvent): Promise<void> {
        const subscribers = this.getSubscribersForEvent(event);

        for (const subscriber of subscribers) {
            if (subscriber.blocking) {
                await this.notifyBlockingSubscriber(event, subscriber);
            } else {
                this.notifyNonBlockingSubscriber(event, subscriber);
            }
        }
    }

    protected notifyBlockingSubscriber<TEvent extends IEvent = IEvent>(
        event: TEvent,
        subscriber: IBlockingSubscriber<TEvent>
    ): Promise<void> {
        let notifyNext: ResolveCallback<void>;
        const promise: Promise<void> = new Promise((resolve) => {
            notifyNext = resolve;
        });
        subscriber.notify(event, notifyNext!);
        return promise;
    }

    protected notifyNonBlockingSubscriber<TEvent extends IEvent = IEvent>(
        event: TEvent,
        subscriber: INonBlockingSubscriber<TEvent>
    ): void {
        subscriber.notify(event);
    }

    protected getEventCategories<TEvent extends IEvent = IEvent>(
        event: TEvent
    ): Iterable<TEventCategory> {
        return Generator.filter(
            (eventCategory) => eventCategory.has(event),
            this.eventCategories
        );
    }

    protected getSubscribersForEvent<TEvent extends IEvent = IEvent>(
        event: TEvent
    ): Iterable<ISubscriber<IEvent>> {
        const eventCategories = this.getEventCategories(event);

        return Generator.chain_from_iterable(
            Generator.map(
                (eventCategory) =>
                    this.getSubscribersForEventCategory(eventCategory),
                eventCategories
            )
        );
    }

    protected *getSubscribersForEventCategory(
        eventCategory: TEventCategory
    ): Iterable<ISubscriber<IEvent>> {
        const priorityToSubscribers = this.subscribers.get(eventCategory);

        for (const [_priority, subscribers] of priorityToSubscribers) {
            yield* subscribers;
        }
    }
}
