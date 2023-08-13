import type { CharacterId } from './character-id';

export interface ICustomCharacterIdProvider {
    createCustomCharacterId(customName: string): Promise<CharacterId>;

    isCustomCharacterId(id: CharacterId): Promise<boolean>;
}
