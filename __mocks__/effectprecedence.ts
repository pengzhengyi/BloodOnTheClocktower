export const getPriorityMock = jest.fn();
export const compareMock = jest.fn();

export const EffectPrecedence = {
    getPriority: getPriorityMock,
    compare: compareMock,
};
