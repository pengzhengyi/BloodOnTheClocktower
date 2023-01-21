import { mockWithPropertyValue } from './common';
import type {
    IBlockingSubscriber,
    INonBlockingSubscriber,
} from '~/game/event-notification/types';

export function mockNonBlockingSubscriber() {
    return mockWithPropertyValue<INonBlockingSubscriber, false>(
        'blocking',
        false
    );
}

export function mockBlockingSubscriber() {
    return mockWithPropertyValue<IBlockingSubscriber, true>('blocking', true);
}
