import type { CharacterId } from './character-id';

export interface IOfficialCharacterIdProvider {
    getOfficialCharacterIds(): Promise<Set<CharacterId>>;

    isOfficialCharacterId(id: CharacterId): Promise<boolean>;
}
