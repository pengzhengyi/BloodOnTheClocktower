import type { IEditionDefinition } from '../edition-definition';

export interface IEditionDefinitionParser<TInput> {
    parse(input: TInput): Promise<IEditionDefinition>;
}
