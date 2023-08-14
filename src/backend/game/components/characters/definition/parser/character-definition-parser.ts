import type { IParser } from '../../../../../common/interfaces/parser';
import type { ICharacterDefinition } from '../character-definition';

export interface ICharacterDefinitionParser<TInput>
    extends IParser<TInput, ICharacterDefinition> {}
