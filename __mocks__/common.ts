import { mock } from 'jest-mock-extended';

export function mockWithGetter<O, T, Y extends any[]>(
    propertyName: string,
    mockFunction: jest.Mock<T, Y>
): O {
    // https://github.com/marchaos/jest-mock-extended/issues/29
    const baseMock = {};
    // @ts-ignore: allow flexible mocking
    const mockObject = mock<O>(baseMock);
    Object.defineProperty(baseMock, propertyName, { get: mockFunction });
    return mockObject;
}

export function mockWithPropertyValue<O, T>(
    propertyName: string,
    propertyValue: T
): O {
    const mockGetter = jest.fn<T, []>();
    mockGetter.mockReturnValue(propertyValue);
    return mockWithGetter(propertyName, mockGetter);
}
