import type { ObjectSchema } from 'yup';
import { object, string, array, number, boolean } from 'yup';
import type { TJSON } from '../../../../../../common/types/json';
import type { ICharacterDefinition } from '../character-definition';
import { RequiredCharacterDefinitionKeyNames } from '../definition-keynames';
import type { ICharacterDefinitionParser } from './character-definition-parser';

export abstract class CharacterDefinitionJsonParser
    implements ICharacterDefinitionParser<TJSON>
{
    protected static characterDefinitionSchema: ObjectSchema<ICharacterDefinition> =
        object({
            [RequiredCharacterDefinitionKeyNames.ABILITY]: string().required(),
            [RequiredCharacterDefinitionKeyNames.EDITION]: string().required(),
            [RequiredCharacterDefinitionKeyNames.FIRST_NIGHT]: number()
                .min(0)
                .integer()
                .required(),
            [RequiredCharacterDefinitionKeyNames.FIRST_NIGHT_REMINDER]:
                string().required(),
            [RequiredCharacterDefinitionKeyNames.ID]: string().required(),
            [RequiredCharacterDefinitionKeyNames.NAME]: string().required(),
            [RequiredCharacterDefinitionKeyNames.OTHER_NIGHT]: number()
                .min(0)
                .integer()
                .required(),
            [RequiredCharacterDefinitionKeyNames.OTHER_NIGHT_REMINDER]:
                string().required(),
            [RequiredCharacterDefinitionKeyNames.REMINDERS]: array(
                string().required()
            ).required(),
            [RequiredCharacterDefinitionKeyNames.SETUP]: boolean().required(),
            [RequiredCharacterDefinitionKeyNames.TEAM]: string().required(),
            customProperties: object().optional(),
        });

    parse(input: TJSON): Promise<ICharacterDefinition> {
        return CharacterDefinitionJsonParser.characterDefinitionSchema.validate(
            input
        );
        // TODO .catch(this.adaptValidationErrors);
    }
}
