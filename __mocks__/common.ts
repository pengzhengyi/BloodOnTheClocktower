import { mock } from 'jest-mock-extended';
import { Generator } from '~/game/collections';

export function mockWithPropertyValue<O, T>(
    propertyName: string & keyof O,
    propertyValue: T
): O {
    return mockWithPropertyValues<O, [T]>([propertyName], [propertyValue]);
}

export function mockWithPropertyValues<O, T extends any[]>(
    propertyNames: (string & keyof O)[],
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

type ModifyMockFunction = (mockFunction: jest.Mock) => void;

export function mockObject<O, T extends any[]>(
    propertyNames: (string & keyof O)[],
    propertyValues: T,
    functions: { [key: string]: ModifyMockFunction }
): O {
    const mockObject = mockWithPropertyValues<O, T>(
        propertyNames,
        propertyValues
    );

    for (const [
        functionName,
        functionFactory,
    ] of Object.entries<ModifyMockFunction>(functions)) {
        functionFactory((mockObject as any)[functionName] as jest.Mock);
    }

    return mockObject;
}
