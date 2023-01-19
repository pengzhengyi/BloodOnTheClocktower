import { mockDeep } from 'jest-mock-extended';
import { GAME_UI } from './game-ui';
import type { IEnvironment } from '~/interaction/environment';

export function _mockEnvironment(): IEnvironment {
    // TODO use new environment for testing
    return mockDeep<IEnvironment>();
}

export function mockEnvironment(): IEnvironment {
    return {
        gameUI: GAME_UI,
    };
}
