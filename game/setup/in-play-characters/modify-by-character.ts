import type { CharacterToken } from '~/game/character/character';
import type { CharacterId } from '~/game/character/character-id';
import type { ICharacterSheet } from '~/game/character/character-sheet';
import { Generator } from '~/game/collections';
import { adaptCharacterTypeToCharacter, chainCharacters } from '~/game/common';
import type { NumberOfCharacters } from '~/game/script-tool';
import type { ICharacterTypeToCharacter } from '~/game/types';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface IInPlayCharactersModification {
    add?: ICharacterTypeToCharacter;
    remove?: ICharacterTypeToCharacter;
}

export function applyModifications(
    initialInPlayCharacters: ICharacterTypeToCharacter,
    modifications: Iterable<IInPlayCharactersModification>
): ICharacterTypeToCharacter {
    const initialInPlay: Iterable<CharacterToken> = chainCharacters(
        initialInPlayCharacters
    );

    const finalInPlay = Generator.reduce(
        (inPlayCharacters, modification) => {
            if (modification.add !== undefined) {
                inPlayCharacters = Generator.chain(
                    inPlayCharacters,
                    chainCharacters(modification.add)
                );
            }

            if (modification.remove !== undefined) {
                inPlayCharacters = Generator.exclude(
                    inPlayCharacters,
                    chainCharacters(modification.remove)
                );
            }

            return inPlayCharacters;
        },
        initialInPlay,
        modifications
    );

    const finalInPlayCharacters = Generator.groupBy(
        finalInPlay,
        (character) => character.characterType.id
    );

    const characterTypeToCharacter = adaptCharacterTypeToCharacter(
        Object.fromEntries(finalInPlayCharacters)
    );

    return characterTypeToCharacter;
}

export interface IModifyByCharacter {
    readonly characterId: CharacterId;

    modifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter
    ): Promise<IInPlayCharactersModification>;
}

export interface IModifyContext {
    characterSheet: ICharacterSheet;
    initialInPlayCharacters: ICharacterTypeToCharacter;
    modification: Partial<NumberOfCharacters>;
}

export abstract class AbstractModifyByCharacter implements IModifyByCharacter {
    abstract characterId: CharacterId;

    protected abstract modification: Partial<NumberOfCharacters>;

    modifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter
    ): Promise<IInPlayCharactersModification> {
        return this.storytellerModifyInitialInPlayCharacters(
            characterSheet,
            initialInPlayCharacters,
            this.modification
        );
    }

    protected async storytellerModifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter,
        modification: Partial<NumberOfCharacters>
    ): Promise<IInPlayCharactersModification> {
        const reason = this.formatPromptForStorytellerToModify(modification);
        const context: IModifyContext = {
            characterSheet,
            initialInPlayCharacters,
            modification,
        };
        const decision =
            await InteractionEnvironment.current.gameUI.storytellerDecide<IInPlayCharactersModification>(
                { context },
                { reason }
            );
        return decision.decided;
    }

    protected formatPromptForStorytellerToModify(
        modification: Partial<NumberOfCharacters>
    ): string {
        const modificationForCharacterType: Array<string> = [];

        for (const characterType in modification) {
            const numToChange = (modification as Record<string, number>)[
                characterType
            ];
            if (numToChange > 0) {
                modificationForCharacterType.push(
                    `add ${numToChange} ${characterType}`
                );
            } else if (numToChange < 0) {
                modificationForCharacterType.push(
                    `remove ${numToChange} ${characterType}`
                );
            }
        }

        const prompt = modificationForCharacterType.join(', ');
        return prompt;
    }
}
