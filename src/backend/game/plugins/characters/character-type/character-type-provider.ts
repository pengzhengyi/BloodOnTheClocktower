import type { ICharacterType } from './character-type';

export interface ICharacterTypeProvider {
    getCharacterTypes(): Promise<Set<ICharacterType>>;

    loadCharacterType(name: string): Promise<ICharacterType | undefined>;
}
