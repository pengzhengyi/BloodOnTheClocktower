import { mock } from 'jest-mock-extended';
import { NightSheet } from '~/game/nightsheet';

export function mockNightSheet(): NightSheet {
    return mock<NightSheet>();
}
