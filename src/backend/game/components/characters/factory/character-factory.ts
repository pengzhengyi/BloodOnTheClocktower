import type { ICharacter } from '../character';

export interface ICharacterFactory {
    createCustomCharacter(): Promise<ICharacter>;
}
