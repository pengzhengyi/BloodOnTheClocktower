import type { IParser } from '../../../../../../common/interfaces/parser';
import type { IEditionDefinition } from '../edition-definition';

export interface IEditionDefinitionParser<TInput>
    extends IParser<TInput, IEditionDefinition> {}
