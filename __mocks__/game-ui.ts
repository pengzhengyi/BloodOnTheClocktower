import { mock } from 'jest-mock-extended';
import { Generator } from '~/game/collections';
import type { Predicate } from '~/game/types';
import { Environment } from '~/interaction/environment';
import type { IGameUI } from '~/interaction/game-ui';

export const hasRaisedHandForVoteMock = Environment.current.gameUI
    .hasRaisedHandForVote as jest.Mock;
export const handleMock = Environment.current.gameUI.handle as jest.Mock;
export const chooseMock = Environment.current.gameUI.choose as jest.Mock;
export const storytellerChooseMock = Environment.current.gameUI
    .storytellerChoose as jest.Mock;
export const storytellerChooseOneMock = Environment.current.gameUI
    .storytellerChooseOne as jest.Mock;
export const storytellerDecideMock = Environment.current.gameUI
    .storytellerDecide as jest.Mock;
export const confirmMock = Environment.current.gameUI.confirm as jest.Mock;
export const storytellerConfirmMock = Environment.current.gameUI
    .storytellerConfirm as jest.Mock;
export const sendMock = Environment.current.gameUI.send as jest.Mock;
export const callForNominationMock = Environment.current.gameUI
    .callForNomination as jest.Mock;

export function mockGameUI() {
    return mock<IGameUI>();
}

export function mockStorytellerChooseMatchingOne<T>(
    predicate: Predicate<T>,
    expectNumOptions?: number
) {
    storytellerChooseOneMock.mockImplementation((options: Iterable<T>) => {
        const optionsArray = Array.from(options);

        if (expectNumOptions !== undefined) {
            expect(optionsArray).toHaveLength(expectNumOptions);
        }

        const found = Generator.find(predicate, optionsArray);

        expect(found).toBeDefined();
        return Promise.resolve(found);
    });
}

export function mockStorytellerChooseFirstOne<T>() {
    storytellerChooseOneMock.mockImplementation((options: Iterable<T>) =>
        Promise.resolve(Generator.take(1, options))
    );
}
