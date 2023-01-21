import type { IGamePhaseEvent } from '~/game/event-notification/event/game-phase';
import { GamePhaseNotification } from '~/game/event-notification/notification/game-phase';
import type { IGamePhase } from '~/game/game-phase';
import { Phase } from '~/game/phase';
import { mockWithPropertyValue } from '~/__mocks__/common';
import {
    mockBlockingSubscriber,
    mockNonBlockingSubscriber,
} from '~/__mocks__/event-notification';
import { mockGamePhaseAtPhase } from '~/__mocks__/game-phase';

describe('test game phase EventNotification', () => {
    let notification: GamePhaseNotification;

    const dayEventCategory = GamePhaseNotification.getEventCategory(Phase.Day);

    const nightEventCategory = GamePhaseNotification.getEventCategory(
        Phase.Night
    );

    beforeEach(() => {
        notification = new GamePhaseNotification();
    });

    test('subscribe and get notified', async () => {
        // first subscriber get notified for day
        const firstSubscriber = mockNonBlockingSubscriber();
        notification.subscribe(dayEventCategory, firstSubscriber);

        // second subscriber get notified at night
        const secondSubscriber = mockNonBlockingSubscriber();
        notification.subscribe(nightEventCategory, secondSubscriber);

        // notify a day event, first subscriber should get notified
        const mockDayGamePhase = mockGamePhaseAtPhase(Phase.Day);
        const firstEvent = mockWithPropertyValue<IGamePhaseEvent, IGamePhase>(
            'gamePhase',
            mockDayGamePhase
        );
        await notification.notify(firstEvent);

        expect(firstSubscriber.notify).toHaveBeenCalledOnce();
        expect(secondSubscriber.notify).not.toHaveBeenCalled();

        // unsubscribe first subscriber and notify a night event, second subscriber should get notified
        notification.unsubscribe(dayEventCategory, firstSubscriber);

        const mockNightGamePhase = mockGamePhaseAtPhase(Phase.Night);
        const secondEvent = mockWithPropertyValue<IGamePhaseEvent, IGamePhase>(
            'gamePhase',
            mockNightGamePhase
        );
        await notification.notify(secondEvent);

        expect(firstSubscriber.notify).toHaveBeenCalledOnce();
        expect(secondSubscriber.notify).toHaveBeenCalledOnce();
    });

    test('blocking subscriber with different priority ', async () => {
        // both subscriber get notified at night, but first subscriber has a higher priority
        const firstSubscriber = mockBlockingSubscriber();
        const secondSubscriber = mockBlockingSubscriber();

        (firstSubscriber.notify as jest.Mock).mockImplementation(
            (_event, notifyNext) => {
                expect(firstSubscriber.notify).toHaveBeenCalledOnce();
                expect(secondSubscriber.notify).not.toHaveBeenCalled();
                notifyNext();
            }
        );
        (secondSubscriber.notify as jest.Mock).mockImplementation(
            (_event, notifyNext) => {
                expect(firstSubscriber.notify).toHaveBeenCalledOnce();
                expect(secondSubscriber.notify).toHaveBeenCalledOnce();
                notifyNext();
            }
        );

        // priority will determine which subscriber is first notified
        notification.subscribe(nightEventCategory, secondSubscriber, 10);
        notification.subscribe(nightEventCategory, firstSubscriber, 100);

        await notification.notify(nightEventCategory);
    });
});
