import { mockDeep } from 'jest-mock-extended';
import { mockSetupContext, createBasicSetupSheet } from './setup-sheet';
import { type IGame, Game } from '~/game/game';
import type { ISetupSheet, ISetupContext } from '~/game/setup-sheet';

export function mockGame(): IGame {
    return mockDeep<IGame>();
}

export async function createBasicGame(
    setupSheet?: ISetupSheet,
    setupContext?: Partial<ISetupContext>
): Promise<IGame> {
    setupSheet ??= createBasicSetupSheet();
    setupContext = mockSetupContext(setupContext);

    return await Game.init(setupSheet, setupContext);
}
