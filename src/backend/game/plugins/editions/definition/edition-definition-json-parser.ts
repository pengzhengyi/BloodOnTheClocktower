import type { ObjectSchema, ValidationError } from 'yup';
import { object, string, array } from 'yup';
import type { TJSON } from '../../../../common/types/json';
import type { IEditionDefinition } from './edition-definition';
import { IncorrectFormatParseEditionDefinitionException } from './edition-definition-parse-exception';
import type { IEditionDefinitionParser } from './edition-definition-parser';
import { RequiredEditionDefinitionKeyNames } from './definition-keynames';

export abstract class EditionDefinitionJsonParser
    implements IEditionDefinitionParser<TJSON>
{
    protected editionDefinitionSchema: ObjectSchema<IEditionDefinition> =
        object({
            [RequiredEditionDefinitionKeyNames.NAME]: string().required(),
            [RequiredEditionDefinitionKeyNames.CHARACTERS]: array(
                string().required()
            ).required(),
            customProperties: object().optional(),
        });

    parse(input: TJSON): Promise<IEditionDefinition> {
        return this.editionDefinitionSchema.validate(input);
        // TODO .catch(this.adaptValidationErrors);
    }

    protected adaptValidationErrors(errors: ValidationError): never {
        throw new IncorrectFormatParseEditionDefinitionException(
            errors,
            errors.message
        );
    }
}
