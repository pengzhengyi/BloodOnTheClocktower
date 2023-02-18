import type { RoleData } from '../types';
import type { ICharacter } from './character';
import { Character } from './character';
import type {
    ICharacterDefinitionProvider,
    IAsyncCharacterDefinitionProvider,
} from './character-definition-provider';
import type { CharacterId } from './character-id';

export interface ICharacterFromDefinition {
    /**
     * Instantiate a character based on its definition.
     *
     * As a good practice, only one instance exists for each character (for example, there should be one Washerwoman instance, one Librarian instance, etc.) Therefore, the output should ideally be cached and reused.
     * @param definition The definition of the character.
     * @returns An instance of the cgharacter.
     */
    getCharacter(definition: Partial<RoleData>): ICharacter;
}

export class CharacterFromDefinition implements ICharacterFromDefinition {
    getCharacter(definition: Partial<RoleData>): ICharacter {
        const CharacterClass = class extends Character {
            // eslint-disable-next-line no-useless-constructor
            constructor(definition: Partial<RoleData>) {
                super(definition);
            }
        };
        const character = new CharacterClass(definition);
        return character;
    }
}

export interface ICharacterFromId {
    /**
     * Instantiate a character based on its id.
     *
     * As a good practice, only one instance exists for each character (for example, there should be one Washerwoman instance, one Librarian instance, etc.) Therefore, the output should ideally be cached and reused.
     * @param id The unique id identifying the character.
     */
    getCharacter(id: CharacterId): ICharacter;

    getCharacterAsync(id: CharacterId): Promise<ICharacter>;
}

abstract class AbstractCharacterFromId implements ICharacterFromId {
    protected readonly characterFromDefinition: ICharacterFromDefinition;

    constructor(characterFromDefinition: ICharacterFromDefinition) {
        this.characterFromDefinition = characterFromDefinition;
    }

    getCharacter(id: CharacterId): ICharacter {
        const definition = this.getCharacterDefinition(id);
        const character = this.characterFromDefinition.getCharacter(definition);
        return character;
    }

    async getCharacterAsync(id: CharacterId): Promise<ICharacter> {
        const definition = await this.getCharacterDefinitionAsync(id);
        const character = this.characterFromDefinition.getCharacter(definition);
        return character;
    }

    protected abstract getCharacterDefinition(
        id: CharacterId
    ): Partial<RoleData>;

    protected abstract getCharacterDefinitionAsync(
        id: CharacterId
    ): Promise<Partial<RoleData>>;
}

export class CharacterFromId extends AbstractCharacterFromId {
    protected characterDefinitionProvider: ICharacterDefinitionProvider &
        IAsyncCharacterDefinitionProvider;

    constructor(
        characterFromDefinition: ICharacterFromDefinition,
        characterDefinitionProvider: ICharacterDefinitionProvider &
            IAsyncCharacterDefinitionProvider
    ) {
        super(characterFromDefinition);

        this.characterDefinitionProvider = characterDefinitionProvider;
    }

    protected getCharacterDefinition(id: CharacterId): Partial<RoleData> {
        return this.characterDefinitionProvider.getCharacterDefinition(id);
    }

    protected getCharacterDefinitionAsync(
        id: CharacterId
    ): Promise<Partial<RoleData>> {
        return this.characterDefinitionProvider.getCharacterDefinitionAsync(id);
    }
}
