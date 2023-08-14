import type { ObjectSchema, ValidationError } from 'yup';
import { object, string, array } from 'yup';
import type { TJSON } from '../../../../../common/types/json';
import type { IEditionDefinition } from '../edition-definition';
import { RequiredEditionDefinitionKeyNames } from '../definition-keynames';
import { CharacterTypeKeyNames } from '../definition-characters-character-type-keynames';
import { IncorrectFormatParseEditionDefinitionException } from './edition-definition-parse-exception';
import type { IEditionDefinitionParser } from './edition-definition-parser';

export abstract class EditionDefinitionJsonParser
    implements IEditionDefinitionParser<TJSON>
{
    protected static editionDefinitionSchema: ObjectSchema<IEditionDefinition> =
        object({
            [RequiredEditionDefinitionKeyNames.NAME]: string().required(),
            [RequiredEditionDefinitionKeyNames.CHARACTERS]: object({
                [CharacterTypeKeyNames.Demons]: array(
                    string().required()
                ).required(),
                [CharacterTypeKeyNames.Fabled]: array(
                    string().required()
                ).optional(),
                [CharacterTypeKeyNames.Minions]: array(
                    string().required()
                ).required(),
                [CharacterTypeKeyNames.Outsiders]: array(
                    string().required()
                ).required(),
                [CharacterTypeKeyNames.Townsfolk]: array(
                    string().required()
                ).required(),
                [CharacterTypeKeyNames.Travellers]: array(
                    string().required()
                ).optional(),
            }).required(),
            customProperties: object().optional(),
        });

    parse(input: TJSON): Promise<IEditionDefinition> {
        return EditionDefinitionJsonParser.editionDefinitionSchema.validate(
            input
        );
        // TODO .catch(this.adaptValidationErrors);
    }

    protected adaptValidationErrors(errors: ValidationError): never {
        throw new IncorrectFormatParseEditionDefinitionException(
            errors,
            errors.message
        );
    }
}
