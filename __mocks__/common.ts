import { mock } from 'jest-mock-extended';
import { Generator } from '~/game/collections';

export function mockWithPropertyValue<O, T>(
    propertyName: string,
    propertyValue: T
): O {
    return mockWithPropertyValues<O, [T]>([propertyName], [propertyValue]);
}

export function mockWithPropertyValues<O, T extends any[]>(
    propertyNames: string[],
    propertyValues: T
): O {
    const baseMock = {};
    // @ts-ignore: allow flexible mocking
    const mockObject = mock<O>(baseMock);

    for (const [propertyName, propertyValue] of Generator.pair(
        propertyNames,
        propertyValues
    )) {
        const mockGetter = jest.fn<T, []>();
        mockGetter.mockReturnValue(propertyValue);
        Object.defineProperty(baseMock, propertyName, { get: mockGetter });
    }

    return mockObject;
}
