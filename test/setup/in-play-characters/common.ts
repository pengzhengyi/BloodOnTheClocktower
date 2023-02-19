import type { CharacterToken } from '~/game/character/character';
import { Generator } from '~/game/collections';
import { adaptCharacterTypeToCharacter } from '~/game/common';
import type { NumberOfCharacters } from '~/game/script-tool';
import type {
    IInPlayCharactersModification,
    IModifyContext,
} from '~/game/setup/in-play-characters/modify-by-character';
import type { ICharacterTypeToCharacter } from '~/game/types';
import { randomCharactersFrom } from '~/__mocks__/character';
import type { AsyncStorytellerDecideImplementation } from '~/__mocks__/game-ui';
import { mockStorytellerDecideImplementation } from '~/__mocks__/game-ui';

export function randomlyDecideForModification(
    context: IModifyContext
): Promise<IInPlayCharactersModification> {
    const actualModification = context.modification;
    const added: Partial<ICharacterTypeToCharacter> = {};
    const removed: Partial<ICharacterTypeToCharacter> = {};

    for (const _characterType in actualModification) {
        const characterType =
            _characterType as keyof ICharacterTypeToCharacter &
                keyof NumberOfCharacters;
        const numCharacters = actualModification[characterType];

        if (numCharacters === undefined) {
            continue;
        }

        const charactersToChooseFrom =
            numCharacters > 0
                ? Generator.exclude(
                      context.characterSheet[characterType],
                      context.initialInPlayCharacters[characterType]
                  )
                : context.initialInPlayCharacters[characterType];

        const selectedCharacters = randomCharactersFrom(
            Math.abs(numCharacters),
            charactersToChooseFrom
        );
        (numCharacters > 0 ? added : removed)[characterType] =
            selectedCharacters;
    }

    const modification: IInPlayCharactersModification = {
        add: adaptCharacterTypeToCharacter(added),
        remove: adaptCharacterTypeToCharacter(removed),
    };
    return Promise.resolve(modification);
}

export function mockStorytellerRandomlyDecideForModification() {
    const implementation: AsyncStorytellerDecideImplementation<
        IModifyContext,
        IInPlayCharactersModification
    > = randomlyDecideForModification;
    mockStorytellerDecideImplementation(implementation);
}

export function mockStorytellerDecideForModification(
    toModify: Record<
        keyof IInPlayCharactersModification,
        Partial<
            Record<
                keyof ICharacterTypeToCharacter,
                Array<CharacterToken> | number
            >
        >
    >
) {
    const implementation: AsyncStorytellerDecideImplementation<
        IModifyContext,
        IInPlayCharactersModification
    > = (context) => {
        const actualModification = context.modification;
        const expectedModification: Partial<NumberOfCharacters> = {};

        const added: Partial<ICharacterTypeToCharacter> = {};
        const removed: Partial<ICharacterTypeToCharacter> = {};

        if (toModify.add !== undefined) {
            for (const characterType in toModify.add) {
                const characterOrNumCharacters =
                    toModify.add[
                        characterType as keyof ICharacterTypeToCharacter
                    ];
                const numCharactersToAdd = Array.isArray(
                    characterOrNumCharacters
                )
                    ? characterOrNumCharacters.length
                    : characterOrNumCharacters;

                if (
                    numCharactersToAdd !== undefined &&
                    numCharactersToAdd !== 0
                ) {
                    expectedModification[
                        characterType as keyof NumberOfCharacters
                    ] = numCharactersToAdd;

                    const addedCharacters = Array.isArray(
                        characterOrNumCharacters
                    )
                        ? characterOrNumCharacters
                        : randomCharactersFrom(
                              numCharactersToAdd,
                              context.characterSheet[
                                  characterType as keyof ICharacterTypeToCharacter
                              ]
                          );
                    added[characterType as keyof ICharacterTypeToCharacter] =
                        addedCharacters;
                }
            }
        }

        if (toModify.remove !== undefined) {
            for (const characterType in toModify.remove) {
                const characterOrNumCharacters =
                    toModify.remove[
                        characterType as keyof ICharacterTypeToCharacter
                    ];
                let numCharactersToRemove = Array.isArray(
                    characterOrNumCharacters
                )
                    ? characterOrNumCharacters.length
                    : characterOrNumCharacters;
                if (numCharactersToRemove !== undefined) {
                    numCharactersToRemove = -Math.abs(numCharactersToRemove);
                }

                if (
                    numCharactersToRemove !== undefined &&
                    numCharactersToRemove !== 0
                ) {
                    expectedModification[
                        characterType as keyof NumberOfCharacters
                    ] = numCharactersToRemove;

                    const removedCharacters = Array.isArray(
                        characterOrNumCharacters
                    )
                        ? characterOrNumCharacters
                        : randomCharactersFrom(
                              Math.abs(numCharactersToRemove),
                              context.characterSheet[
                                  characterType as keyof ICharacterTypeToCharacter
                              ]
                          );
                    removed[characterType as keyof ICharacterTypeToCharacter] =
                        removedCharacters;
                }
            }
        }

        expect(actualModification).toEqual(expectedModification);

        const modification: IInPlayCharactersModification = {
            add: adaptCharacterTypeToCharacter(added),
            remove: adaptCharacterTypeToCharacter(removed),
        };

        return Promise.resolve(modification);
    };

    mockStorytellerDecideImplementation(implementation);
}
