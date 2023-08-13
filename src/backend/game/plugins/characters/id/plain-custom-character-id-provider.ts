import { v4 as uuid, validate } from 'uuid';
import type { CharacterId } from './character-id';
import type { ICustomCharacterIdProvider } from './custom-character-id-provider';

export abstract class PlainCustomCharacterIdProvider
    implements ICustomCharacterIdProvider
{
    createCustomCharacterId(customName: string): Promise<CharacterId> {
        const characterId = CustomCharacterIdFormatter.format(customName);
        return Promise.resolve(characterId);
    }

    isCustomCharacterId(id: CharacterId): Promise<boolean> {
        const isCustomCharacterId = CustomCharacterIdFormatter.validate(id);
        return Promise.resolve(isCustomCharacterId);
    }
}

abstract class CustomCharacterIdFormatter {
    protected static prefix = 'custom-character';

    static format(customName: string, id?: string): string {
        const customId: string = id ?? uuid();

        return `${CustomCharacterIdFormatter.prefix}-${customName}-${customId}`;
    }

    static validate(id: CharacterId): boolean {
        return (
            id.startsWith(CustomCharacterIdFormatter.prefix) &&
            validate(id.slice(-36))
        );
    }
}
