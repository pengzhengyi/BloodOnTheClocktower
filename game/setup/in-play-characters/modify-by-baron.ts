import { AbstractModifyByCharacter } from './modify-by-character';
import { CharacterIds } from '~/game/character/character-id';
import type { NumberOfCharacters } from '~/game/script-tool';

export class ModifyByBaron extends AbstractModifyByCharacter {
    static readonly description =
        'The Baron changes the number of Outsiders present in the game.';

    readonly characterId = CharacterIds.Baron;

    protected modification = {
        outsider: 2,
        townsfolk: -2,
    };

    protected formatPromptForStorytellerToModify(
        modification: Partial<NumberOfCharacters>
    ): string {
        const prompt = super.formatPromptForStorytellerToModify(modification);
        return `${ModifyByBaron.description}: ${prompt}`;
    }
}
