import type { CharacterType } from '../character/character-type';
import type { NumberOfCharacters } from '../script-tool';
import { InvalidScriptConstraints } from './invalid-script-constraints';

export class NegativeNumberForCharacterTypeInScriptConstraint extends InvalidScriptConstraints {
    static description =
        'The number of character for any character type must not be negative';

    constructor(
        readonly constraints: NumberOfCharacters,
        readonly characterType: CharacterType,
        readonly requiredNumber: number
    ) {
        super(constraints);
        this.message =
            NegativeNumberForCharacterTypeInScriptConstraint.description;
    }
}
