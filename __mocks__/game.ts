import { mockDeep } from 'jest-mock-extended';
import { mockSetupContext, createBasicSetupSheet } from './setup-sheet';
import { storytellerChooseOneMock } from './game-ui';
import { type IGame, Game } from '~/game/game';
import type { ISetupSheet, ISetupContext } from '~/game/setup-sheet';
import type { Edition } from '~/game/edition';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';

export function mockGame(): IGame {
    return mockDeep<IGame>();
}

export async function createBasicGame(
    setupSheet?: ISetupSheet,
    setupContext?: Partial<ISetupContext>,
    edition?: typeof Edition
): Promise<IGame> {
    setupSheet ??= createBasicSetupSheet();
    setupContext = mockSetupContext(setupContext);
    edition ??= TroubleBrewing;

    storytellerChooseOneMock.mockResolvedValue(edition);
    const game = await Game.init(setupSheet, setupContext);
    storytellerChooseOneMock.mockReset();
    return game;
}
