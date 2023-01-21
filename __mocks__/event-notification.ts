import { mockWithPropertyValue } from './common';
import type { INonBlockingSubscriber } from '~/game/event-notification/types';

export function mockNonBlockingSubscriber() {
    return mockWithPropertyValue<INonBlockingSubscriber, boolean>(
        'blocking',
        false
    );
}
