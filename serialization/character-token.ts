import type { Schema } from 'yup';
import { mixed, array } from 'yup';

import { DirectSchemaAdapter } from './adapter';
import type { IJSONSerializable } from './types';
import type { CharacterToken } from '~/game/character/character';
import { Character } from '~/game/character/character';
import type { ICharacterLoader } from '~/game/character/character-loader';
import { CharacterLoadFailure } from '~/game/exception/character-load-failure';
import type { TJSON } from '~/game/types';

export interface ICharacterTokenJSONSerializable
    extends IJSONSerializable<CharacterToken> {}

function isCharacterToken(input: any): input is CharacterToken {
    return input.prototype instanceof Character;
}

export class CharacterTokenJSONSerializable
    extends DirectSchemaAdapter<CharacterToken>
    implements ICharacterTokenJSONSerializable
{
    schema: Schema<CharacterToken>;

    static createSchema(characterLoader: ICharacterLoader) {
        return mixed(isCharacterToken)
            .required(CharacterLoadFailure.description)
            .transform((value, _originalValue, context) => {
                if (context.isType(value)) {
                    return value;
                } else {
                    return characterLoader.tryLoad(value);
                }
            });
    }

    constructor(characterLoader: ICharacterLoader) {
        super();
        this.schema =
            CharacterTokenJSONSerializable.createSchema(characterLoader);
    }

    encode(character: CharacterToken): Promise<TJSON> {
        return Promise.resolve(character.id);
    }
}

export interface ICharacterTokenArrayJSONSerializable
    extends IJSONSerializable<Array<CharacterToken>> {}

export class CharacterTokenArrayJSONSerializable
    extends DirectSchemaAdapter<Array<CharacterToken>>
    implements ICharacterTokenArrayJSONSerializable
{
    schema: Schema<Array<CharacterToken>>;

    static createSchema(characterTokenSchema: Schema<CharacterToken>) {
        return array().of(characterTokenSchema).required();
    }

    constructor(characterTokenSchema: Schema<CharacterToken>) {
        super();
        this.schema =
            CharacterTokenArrayJSONSerializable.createSchema(
                characterTokenSchema
            );
    }

    encode(characters: Array<CharacterToken>): Promise<TJSON> {
        return Promise.resolve(characters.map((character) => character.id));
    }
}
