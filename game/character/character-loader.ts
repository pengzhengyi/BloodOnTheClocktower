import { randomChoice } from '../common';
import { NoCharacterMatchingId } from '../exception/no-character-matching-id';
import { Character, type CharacterToken } from './character';
import type { ICharacterFromId } from './character-factory';
import type { CharacterId } from './character-id';
import { CharacterIds } from './character-id';

export interface ICharacterLoader {
    randomLoad(): CharacterToken;
    tryLoad(id: string): CharacterToken | undefined;
    load(id: string): CharacterToken;
    loadAsync(id: string): Promise<CharacterToken>;
}

export class CharacterLoader implements ICharacterLoader {
    protected readonly characterCache: Map<CharacterId, CharacterToken>;

    constructor(protected readonly characterFactory: ICharacterFromId) {
        this.characterCache = new Map();
    }

    randomLoad(): CharacterToken {
        const randomCharacterId = randomChoice(Object.values(CharacterIds));
        return this.load(randomCharacterId);
    }

    tryLoad(id: string): CharacterToken | undefined {
        const characterId: CharacterId = Character.getCanonicalId(id);
        if (!this.characterCache.has(characterId)) {
            return this.loadNewCharacter(characterId);
        }

        return this.characterCache.get(characterId);
    }

    load(id: string): CharacterToken {
        const character = this.tryLoad(id);

        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return character;
    }

    async loadAsync(id: string): Promise<CharacterToken> {
        const characterId: CharacterId = Character.getCanonicalId(id);
        if (!this.characterCache.has(characterId)) {
            return await this.loadNewCharacterAsync(characterId);
        }

        return this.characterCache.get(characterId)!;
    }

    protected loadNewCharacter(id: CharacterId): CharacterToken {
        const character = this.characterFactory.getCharacter(id);
        this.addCharacterToCache(character);
        return character;
    }

    protected async loadNewCharacterAsync(
        id: CharacterId
    ): Promise<CharacterToken> {
        const character = await this.characterFactory.getCharacterAsync(id);
        this.addCharacterToCache(character);
        return character;
    }

    protected addCharacterToCache(character: CharacterToken) {
        this.characterCache.set(character.id, character);
    }
}
