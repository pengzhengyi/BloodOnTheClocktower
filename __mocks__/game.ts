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
import { TroubleBrewing } from './edition';
import { type IGame, Game } from '~/game/game';
import type { ISetupSheet, ISetupContext } from '~/game/setup/setup-sheet';
import type { IEdition } from '~/game/edition/edition';
import type { IDecideInPlayCharactersContext } from '~/game/types';
import type { IModifyContext } from '~/game/setup/in-play-characters/modify-by-character';
import { randomlyDecideForModification } from '~/test/setup/in-play-characters/common';

export function mockGame(): IGame {
    return mockDeep<IGame>();
}

export async function createBasicGame(
    setupSheet?: ISetupSheet,
    setupContext?: Partial<ISetupContext>,
    edition?: IEdition
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

        if ((context as IModifyContext).modification !== undefined) {
            return randomlyDecideForModification(context as IModifyContext);
        }

        return await undefined;
    });
    const game = await Game.init(setupSheet, setupContext);
    storytellerChooseOneMock.mockReset();
    return game;
}
