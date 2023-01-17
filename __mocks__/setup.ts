import { GAME_UI } from '~/__mocks__/gameui';

jest.mock('~/game/dependencies.config', () => ({
    GAME_UI,
}));

// eslint-disable-next-line import/first, import/order
import { setupEffects } from './effects';

setupEffects();
