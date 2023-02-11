import { mock } from 'jest-mock-extended';
import { Generator } from '~/game/collections';
import type { Predicate } from '~/game/types';
import { InteractionEnvironment } from '~/interaction/environment/environment';
import type { IGameUI } from '~/interaction/game-ui';

export const hasRaisedHandForVoteMock = InteractionEnvironment.current.gameUI
    .hasRaisedHandForVote as jest.Mock;
export const handleMock = InteractionEnvironment.current.gameUI
    .handle as jest.Mock;
export const chooseMock = InteractionEnvironment.current.gameUI
    .choose as jest.Mock;
export const storytellerChooseMock = InteractionEnvironment.current.gameUI
    .storytellerChoose as jest.Mock;
export const storytellerChooseOneMock = InteractionEnvironment.current.gameUI
    .storytellerChooseOne as jest.Mock;
export const storytellerDecideMock = InteractionEnvironment.current.gameUI
    .storytellerDecide as jest.Mock;
export const confirmMock = InteractionEnvironment.current.gameUI
    .confirm as jest.Mock;
export const storytellerConfirmMock = InteractionEnvironment.current.gameUI
    .storytellerConfirm as jest.Mock;
export const sendMock = InteractionEnvironment.current.gameUI.send as jest.Mock;
export const callForNominationMock = InteractionEnvironment.current.gameUI
    .callForNomination as jest.Mock;

export function mockGameUI() {
    return mock<IGameUI>();
}

export function mockStorytellerChooseMatchingOne<T>(
    predicate: Predicate<T>,
    expectNumOptions?: number
) {
    storytellerChooseOneMock.mockImplementation((options: Iterable<T>) => {
        let _options: Iterable<T>;

        if (expectNumOptions === undefined) {
            _options = options;
        } else {
            _options = Array.from(options);
            expect(_options).toHaveLength(expectNumOptions);
        }

        const found = Generator.find(predicate, _options);

        expect(found).toBeDefined();
        return Promise.resolve(found);
    });
}

export function mockStorytellerChooseFirstOne<T>() {
    storytellerChooseOneMock.mockImplementation((options: Iterable<T>) =>
        Promise.resolve(Generator.take(1, options))
    );
}
