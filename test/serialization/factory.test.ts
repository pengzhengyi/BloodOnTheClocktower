import type { CharacterToken } from '~/game/character/character';
import { GameEnvironment } from '~/game/environment';
import {
    SerializableTypes,
    SerializationFactory,
} from '~/serialization/factory';
import { randomCharacter } from '~/__mocks__/character';

describe('test Character serialization', () => {
    const factory = new SerializationFactory(
        GameEnvironment.current.characterLoader
    );

    test.concurrent('serialization roundtrip', async () => {
        const character = randomCharacter();

        const serializer = factory.getSerializer<CharacterToken>(
            SerializableTypes.CharacterToken
        );
        const deserializer = factory.getDeserializer<CharacterToken>(
            SerializableTypes.CharacterToken
        );
        const serialized = await serializer.serialize(character);
        const deserialized = await deserializer.deserialize(serialized);

        expect(deserialized).toEqual(character);
    });
});
