import { mock } from 'jest-mock-extended';
import { Generator } from '~/game/collections';
import type { IPlayer } from '~/game/player';
import type { Predicate } from '~/game/types';
import { InteractionEnvironment } from '~/interaction/environment/environment';
import type { IPlayerChooseFrom } from '~/interaction/ui/features/choose';
import type {
    IChooseOptions,
    IStorytellerChooseOneOptions,
} from '~/interaction/ui/features/options/interaction-options';
import type {
    IChooseFromOptions,
    IDecideFrom,
} from '~/interaction/ui/features/types';
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

type AsyncStorytellerChooseOneImplementation<T> = (
    options: Iterable<T>,
    reason?: string
) => Promise<T>;

export function mockStorytellerChooseOne<T>(
    chooseImpl: AsyncStorytellerChooseOneImplementation<T>
) {
    const implementation = async (
        chooseFrom: IChooseFromOptions<T>,
        options?: IStorytellerChooseOneOptions
    ) => {
        const chosen = await chooseImpl(chooseFrom.options, options?.reason);
        return chosen;
    };

    storytellerChooseOneMock.mockImplementation(implementation);
}

export function mockStorytellerChooseFirstOne() {
    mockStorytellerChooseOne((options) =>
        Promise.resolve(Generator.take(1, options))
    );
}

export function mockStorytellerChooseMatchingOne<T>(
    predicate: Predicate<T>,
    expectNumOptions?: number
) {
    mockStorytellerChooseOne<T>((options) => {
        let _options: Iterable<T>;

        if (expectNumOptions === undefined) {
            _options = options;
        } else {
            _options = Array.from(options);
            expect(_options).toHaveLength(expectNumOptions);
        }

        const found = Generator.find(predicate, _options);

        expect(found).toBeDefined();
        return Promise.resolve(found!);
    });
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
        chooseFrom: IPlayerChooseFrom<T>,
        _options?: IChooseOptions
    ) => {
        const chosen = await chooseImpl(chooseFrom.player, chooseFrom.options);
        const chosenAsArray = Array.isArray(chosen) ? chosen : [chosen];
        const chosenChoices = { choices: chosenAsArray };
        return chosenChoices;
    };
    chooseMock.mockImplementation(implementation);
}

export type AsyncStorytellerDecideImplementation<TContext, T> = (
    context: TContext
) => Promise<T>;
export function mockStorytellerDecideImplementation<TContext, T>(
    decideImpl: AsyncStorytellerDecideImplementation<TContext, T>
) {
    const implementation = async (decideFrom: IDecideFrom<T>) => {
        const context = decideFrom.context as TContext;
        const decided = await decideImpl(context);
        return { decided };
    };
    storytellerDecideMock.mockImplementation(implementation);
}
