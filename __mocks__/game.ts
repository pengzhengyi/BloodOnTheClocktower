import { mockDeep } from 'jest-mock-extended';
import {
    mockSetupContext,
    createBasicSetupSheet,
    randomChooseInPlayCharacters,
} from './setup-sheet';
import {
    mockStorytellerDecideImplementation,
    storytellerChooseOneMock,
} from './game-ui';
import { type IGame, Game } from '~/game/game';
import type { ISetupSheet, ISetupContext } from '~/game/setup-sheet';
import type { Edition } from '~/game/edition';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import type { IDecideInPlayCharactersContext } from '~/game/types';

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
    mockStorytellerDecideImplementation(async (context) => {
        if (
            (context as IDecideInPlayCharactersContext)
                .numToChooseForEachCharacterType !== undefined
        ) {
            return randomChooseInPlayCharacters(
                context as IDecideInPlayCharactersContext
            );
        }

        return await undefined;
    });
    const game = await Game.init(setupSheet, setupContext);
    storytellerChooseOneMock.mockReset();
    return game;
}
