import {
    CharacterTokenJSONSerializable,
    CharacterTokenArrayJSONSerializable,
} from './character-token';
import type {
    IDeserializer,
    IJSONDecoder,
    IJSONEncoder,
    IJSONSerializable,
    ISerializationFactory,
    ISerializer,
} from './types';
import type { ICharacterLoader } from '~/game/character/character-loader';
import { UnsupportedSerializationType } from '~/game/exception/unsupported-serialization-type';

export enum SerializableTypes {
    CharacterToken = 'CharacterToken',
    ArrayOfCharacterToken = 'Array<CharacterToken>',
}

export class SerializationFactory
    implements ISerializationFactory<SerializableTypes>
{
    protected readonly registry = new Map<
        SerializableTypes,
        IJSONSerializable<any>
    >();

    constructor(characterLoader: ICharacterLoader) {
        this.buildRegistry(characterLoader);
    }

    getEncoder<T>(key: SerializableTypes): IJSONEncoder<T> {
        const encoder = this.registry.get(key);
        this.assertIsSupportedSerializationType<T>(key, encoder);
        return encoder;
    }

    getDecoder<T>(key: SerializableTypes): IJSONDecoder<T> {
        const decoder = this.registry.get(key);
        this.assertIsSupportedSerializationType<T>(key, decoder);
        return decoder;
    }

    getSerializer<T>(key: SerializableTypes): ISerializer<T> {
        const serializer = this.registry.get(key);
        this.assertIsSupportedSerializationType<T>(key, serializer);
        return serializer;
    }

    getDeserializer<T>(key: SerializableTypes): IDeserializer<T> {
        const deserializer = this.registry.get(key);
        this.assertIsSupportedSerializationType<T>(key, deserializer);
        return deserializer;
    }

    protected buildRegistry(characterLoader: ICharacterLoader) {
        // SerializableTypes.CharacterToken
        const characterTokenJSONSerializable =
            new CharacterTokenJSONSerializable(characterLoader);
        this.registry.set(
            SerializableTypes.CharacterToken,
            characterTokenJSONSerializable
        );

        // SerializableTypes.ArrayOfCharacterToken
        const arrayOfCharacterTokenJSONSerializable =
            new CharacterTokenArrayJSONSerializable(
                characterTokenJSONSerializable.schema
            );
        this.registry.set(
            SerializableTypes.ArrayOfCharacterToken,
            arrayOfCharacterTokenJSONSerializable
        );
    }

    protected assertIsSupportedSerializationType<T = any>(
        key: SerializableTypes,
        value: IJSONSerializable<T> | undefined
    ): asserts value is IJSONSerializable<T> {
        if (value === undefined) {
            throw new UnsupportedSerializationType(
                key,
                this,
                this.registry.keys()
            );
        }
    }
}
