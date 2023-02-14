import { mock } from 'jest-mock-extended';
import type { CharacterToken } from '~/game/character/character';
import { Generator } from '~/game/collections';
import { SeatAssignmentMode } from '~/game/seating/seat-assignment-mode';
import type { ISetupContext, ISetupSheet } from '~/game/setup-sheet';
import { SetupSheet } from '~/game/setup-sheet';
import type {
    ICharacterTypeToCharacter,
    IDecideInPlayCharactersContext,
} from '~/game/types';

export function mockSetupSheet(): ISetupSheet {
    return mock<ISetupSheet>();
}

export function createBasicSetupSheet(): ISetupSheet {
    return SetupSheet.getInstance();
}

export function mockSetupContext(
    setupContext?: Partial<ISetupContext>
): ISetupContext {
    const _setupContext = mock<ISetupContext>();
    _setupContext.seatAssignment = SeatAssignmentMode.NaturalInsert;

    if (setupContext !== undefined) {
        Object.assign(_setupContext, setupContext);
    }

    return _setupContext;
}

export function randomChooseInPlayCharacters(
    context: IDecideInPlayCharactersContext
): ICharacterTypeToCharacter {
    const initialInPlayCharacters: Partial<ICharacterTypeToCharacter> = {};

    for (const [characterType, characters] of context.characterSheet
        .characterTypeToCharacters) {
        const characterTypeId =
            characterType.id as keyof IDecideInPlayCharactersContext['numToChooseForEachCharacterType'];
        const numToChoose =
            context.numToChooseForEachCharacterType[characterTypeId];
        if (numToChoose === undefined) {
            throw new Error(
                `Not specified number of characters to choose for character type ${characterType}`
            );
        }
        const chosenCharacters = Generator.take(
            numToChoose,
            Generator.shuffle(characters)
        ) as Array<CharacterToken>;

        initialInPlayCharacters[characterTypeId] = chosenCharacters;
    }

    return initialInPlayCharacters as ICharacterTypeToCharacter;
}
