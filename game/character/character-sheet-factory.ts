import { Generator, LazyMap } from '../collections';
import { parsePromiseSettledResults, Singleton } from '../common';
import type { Edition } from '../edition';
import { GameEnvironment } from '../environment';
import { CharacterLoadFailures } from '../exception/character-load-failures';
import type { GameError } from '../exception/exception';
import { NoCharacterMatchingId } from '../exception/no-character-matching-id';
import { IncompleteEditionData } from '../exception/incomplete-edition-data';
import type { ISingleton } from '../types';
import { EditionKeyName } from '../types';
import type { CharacterToken } from './character';
import type { ICharacterSheet } from './character-sheet';
import { CharacterSheet } from './character-sheet';
import type { CharacterType } from './character-type';

export interface ICharacterSheetFactory {
    getFromEdition(edition: typeof Edition): ICharacterSheet;

    getFromCharacterIds(characterIds: Iterable<string>): ICharacterSheet;

    getFromCharacters(characters: Iterable<CharacterToken>): ICharacterSheet;

    getFromCharacterIdsAsync(
        characterIds: Iterable<string>
    ): Promise<ICharacterSheet>;

    getFromTypeToCharacters(
        characterTypeToCharacters: Map<
            typeof CharacterType,
            Array<CharacterToken>
        >
    ): ICharacterSheet;
}

interface AbstractCharacterSheetFactory extends ICharacterSheetFactory {}

abstract class AbstractCharacterSheetFactory {
    protected editionToCharacterSheet: LazyMap<
        typeof Edition,
        ICharacterSheet
    > = new LazyMap((edition) => this.getFromEditionImpl(edition));

    getFromEdition(edition: typeof Edition): ICharacterSheet {
        const characterSheet = this.editionToCharacterSheet.get(edition);
        return characterSheet;
    }

    getFromCharacterIds(characterIds: Iterable<string>): ICharacterSheet {
        const characters = Generator.map((id) => this.find(id), characterIds);
        return this.getFromCharacters(characters);
    }

    async getFromCharacterIdsAsync(
        characterIds: Iterable<string>
    ): Promise<ICharacterSheet> {
        const characterPromises = new Generator(characterIds).map(
            (characterId) => this.findAsync(characterId)
        );
        const characterSettledResults = await Promise.allSettled(
            characterPromises
        );
        const characters = parsePromiseSettledResults<
            CharacterToken,
            GameError
        >(characterSettledResults, (errors, values) => {
            throw new CharacterLoadFailures(errors, values);
        });

        return this.getFromCharacters(characters);
    }

    protected find(id: string) {
        const character = GameEnvironment.current.characterLoader.tryLoad(id);
        return this._validateFoundCharacter(id, character);
    }

    async findAsync(id: string) {
        const character = await GameEnvironment.current.loadCharacterAsync(id);
        return this._validateFoundCharacter(id, character);
    }

    protected getFromEditionImpl(edition: typeof Edition): ICharacterSheet {
        const characterTypeToCharacters =
            edition.editionData[EditionKeyName.CHARACTERS];
        if (characterTypeToCharacters === undefined) {
            throw new IncompleteEditionData(
                edition.editionData,
                EditionKeyName.CHARACTERS
            );
        }
        const characters = Generator.empty<string>();

        for (const key in characterTypeToCharacters) {
            const characterNames = characterTypeToCharacters[key];
            if (Array.isArray(characterNames)) {
                characters.concat(characterNames);
            }
        }

        return this.getFromCharacterIds(characters);
    }

    protected _validateFoundCharacter(id: string, character?: CharacterToken) {
        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return character;
    }
}

class BaseCharacterSheetFactory extends AbstractCharacterSheetFactory {
    getFromCharacters(characters: Iterable<CharacterToken>): ICharacterSheet {
        const characterTypeToCharacters = Generator.groupBy(
            characters,
            (character) => character.characterType
        );
        return this.getFromTypeToCharacters(characterTypeToCharacters);
    }

    getFromTypeToCharacters(
        characterTypeToCharacters: Map<
            typeof CharacterType,
            Array<CharacterToken>
        >
    ) {
        return new CharacterSheet(characterTypeToCharacters);
    }
}

export const CharacterSheetFactory: ISingleton<ICharacterSheetFactory> =
    Singleton<BaseCharacterSheetFactory>(BaseCharacterSheetFactory);
