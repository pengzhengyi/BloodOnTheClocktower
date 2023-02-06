import type { CharacterType } from '../character/character-type';
import {
    Townsfolk,
    Outsider,
    Minion,
    Demon,
    Traveller,
} from '../character/character-type';
import type { ScriptConstraintsHelper } from '../script-tool';
import { InvalidScriptConstraints } from './invalid-script-constraints';

export class TooManyMustIncludedCharacters extends InvalidScriptConstraints {
    static description =
        'The number of characters must include has exceeded the specified number of character for some character type';

    incorrectCharacterTypes: Array<typeof CharacterType> = [];

    constructor(readonly constraintsHelper: ScriptConstraintsHelper) {
        super(constraintsHelper.constraints);
        this.message = TooManyMustIncludedCharacters.description;
    }

    protected validate(): boolean {
        this.incorrectCharacterTypes = [];
        const simplified = this.constraintsHelper.simplify();
        let result = false;

        if (simplified.townsfolk < 0) {
            this.incorrectCharacterTypes.push(Townsfolk);
            result = true;
        }

        if (simplified.outsider < 0) {
            this.incorrectCharacterTypes.push(Outsider);
            result = true;
        }

        if (simplified.minion < 0) {
            this.incorrectCharacterTypes.push(Minion);
            result = true;
        }

        if (simplified.demon < 0) {
            this.incorrectCharacterTypes.push(Demon);
            result = true;
        }

        if (simplified.traveller < 0) {
            this.incorrectCharacterTypes.push(Traveller);
            result = true;
        }

        return result;
    }

    validateOrThrow() {
        return this.throwWhen((error) => error.validate());
    }
}
