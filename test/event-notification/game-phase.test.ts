import type { IGamePhaseEvent } from '~/game/event-notification/event/game-phase';
import { GamePhaseNotification } from '~/game/event-notification/notification/game-phase';
import type { IGamePhase } from '~/game/game-phase';
import { Phase } from '~/game/phase';
import { mockWithPropertyValue } from '~/__mocks__/common';
import { mockNonBlockingSubscriber } from '~/__mocks__/event-notification';
import { mockGamePhaseAtPhase } from '~/__mocks__/game-phase';

describe('test game phase EventNotification', () => {
    test('subscribe and get notified', async () => {
        const notification = new GamePhaseNotification();

        // first subscriber get notified for day
        const firstSubscriber = mockNonBlockingSubscriber();
        const firstEventCategory = GamePhaseNotification.getEventCategory(
            Phase.Day
        );
        notification.subscribe(firstEventCategory, firstSubscriber);

        // second subscriber get notified at night
        const secondSubscriber = mockNonBlockingSubscriber();
        const secondEventCategory = GamePhaseNotification.getEventCategory(
            Phase.Night
        );
        notification.subscribe(secondEventCategory, secondSubscriber);

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
        notification.unsubscribe(firstEventCategory, firstSubscriber);

        const mockNightGamePhase = mockGamePhaseAtPhase(Phase.Night);
        const secondEvent = mockWithPropertyValue<IGamePhaseEvent, IGamePhase>(
            'gamePhase',
            mockNightGamePhase
        );
        await notification.notify(secondEvent);

        expect(firstSubscriber.notify).toHaveBeenCalledOnce();
        expect(secondSubscriber.notify).toHaveBeenCalledOnce();
    });
});
