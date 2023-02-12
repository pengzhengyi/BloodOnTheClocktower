import { mock } from 'jest-mock-extended';
import { Generator } from '~/game/collections';
import type { IPlayer } from '~/game/player';
import type { Predicate } from '~/game/types';
import { InteractionEnvironment } from '~/interaction/environment/environment';
import type { IChooseFrom } from '~/interaction/ui/features/choose';
import type { IChooseOptions } from '~/interaction/ui/features/options/interaction-options';
import type { IGameUI } from '~/interaction/ui/game-ui';

export const hasRaisedHandForVoteMock = InteractionEnvironment.current.gameUI
    .hasRaisedHandForVote as jest.Mock;
export const storytellerHandleMock = InteractionEnvironment.current.gameUI
    .storytellerHandle as jest.Mock;
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

export function mockChoose<T>(value: T | Array<T>) {
    const chosen = Array.isArray(value) ? value : [value];
    const chosenChoices = { choices: chosen };
    chooseMock.mockResolvedValue(chosenChoices);
}

type AsyncChooseImplementation<T> = (
    playerToChoose: IPlayer,
    options: Iterable<T>
) => Promise<T>;
export function mockChooseImplementation<T>(
    chooseImpl: AsyncChooseImplementation<T>
) {
    const implementation = async (
        chooseFrom: IChooseFrom<T>,
        _options?: IChooseOptions
    ) => {
        const chosen = await chooseImpl(chooseFrom.player, chooseFrom.options);
        const chosenAsArray = Array.isArray(chosen) ? chosen : [chosen];
        const chosenChoices = { choices: chosenAsArray };
        return chosenChoices;
    };
    chooseMock.mockImplementation(implementation);
}
