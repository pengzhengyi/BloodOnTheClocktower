import type { CharacterId } from '../../character/character-id';
import { CharacterIds } from '../../character/character-id';
import type { ICharacterSheet } from '../../character/character-sheet';
import type { ICharacterTypeToCharacter } from '../../types';
import type {
    IInPlayCharactersModification,
    IModifyByCharacter,
} from './modify-by-character';
import { applyModifications } from './modify-by-character';
import { ModifyByBaron } from './modify-by-baron';
import type { ICharacter } from '~/game/character/character';
import { chainCharacters } from '~/game/common';
import { RemoveNotExistingInPlayCharacter } from '~/game/exception/remove-not-existing-in-play-character';
import { AddAlreadyExistingInPlayCharacter } from '~/game/exception/add-already-existing-in-play-character';
import { Generator } from '~/game/collections';

export interface IModifyInPlayCharacters {
    /**
     * Determine whether a character will influence whether any characters should be added or removed from the game.
     * @param characterId A character ID.
     * @returns True if the character will influence whether any characters should be added or removed from the game.
     */
    willAddOrRemoveCharacters(characterId: CharacterId): boolean;

    /**
     * Modify the initial in-play characters if any character will add or remove any character tokens.
     *
     * @param characterSheet A character sheet which lists all of the possible characters.
     * @param initialInPlayCharacters Initial in-play characters, will be used to produce the modified in player characters, will not be modified in place.
     */
    modifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter
    ): Promise<ICharacterTypeToCharacter>;
}

abstract class AbstractModifyInPlayCharacters
    implements IModifyInPlayCharacters
{
    protected abstract modifyByCharacters: Map<CharacterId, IModifyByCharacter>;

    willAddOrRemoveCharacters(characterId: CharacterId): boolean {
        return this.modifyByCharacters.has(characterId);
    }

    async modifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter
    ): Promise<ICharacterTypeToCharacter> {
        const modifications: Array<IInPlayCharactersModification> = [];
        const inPlayCharactersNotExamined: Set<ICharacter> = new Set();

        Generator.forEach(
            (character) => inPlayCharactersNotExamined.add(character),
            chainCharacters(initialInPlayCharacters)
        );

        while (inPlayCharactersNotExamined.size > 0) {
            // find until first character that will add or remove characters
            const characterWillModify = Generator.find(
                (notExaminedCharacter) => {
                    inPlayCharactersNotExamined.delete(notExaminedCharacter);

                    return this.modifyByCharacters.has(notExaminedCharacter.id);
                },
                inPlayCharactersNotExamined
            );

            if (characterWillModify === undefined) {
                continue;
            }

            const modifyByCharacter = this.modifyByCharacters.get(
                characterWillModify.id
            )!;
            const modification =
                await modifyByCharacter.modifyInitialInPlayCharacters(
                    characterSheet,
                    initialInPlayCharacters
                );
            modifications.push(modification);

            if (modification.add !== undefined) {
                for (const character of chainCharacters(modification.add)) {
                    if (inPlayCharactersNotExamined.has(character)) {
                        // ! Error: character to add is already in play
                        const currentInPlayCharacters = applyModifications(
                            initialInPlayCharacters,
                            modifications
                        );
                        throw new AddAlreadyExistingInPlayCharacter(
                            character,
                            currentInPlayCharacters
                        );
                    }

                    inPlayCharactersNotExamined.add(character);
                }
            }

            if (modification.remove !== undefined) {
                for (const character of chainCharacters(modification.remove)) {
                    if (!inPlayCharactersNotExamined.delete(character)) {
                        // ! Error: character to remove is not in play
                        const currentInPlayCharacters = applyModifications(
                            initialInPlayCharacters,
                            modifications
                        );
                        throw new RemoveNotExistingInPlayCharacter(
                            character,
                            currentInPlayCharacters
                        );
                    }
                }
            }

            // commit modification and repeat
            break;
        }

        const characterTypeToCharacter = applyModifications(
            initialInPlayCharacters,
            modifications
        );
        return characterTypeToCharacter;
    }
}

export class ModifyInPlayCharacters extends AbstractModifyInPlayCharacters {
    protected static readonly modifyByCharacters: Map<
        CharacterId,
        IModifyByCharacter
    > = new Map([[CharacterIds.Baron, new ModifyByBaron()]]);

    protected get modifyByCharacters() {
        return ModifyInPlayCharacters.modifyByCharacters;
    }
}
