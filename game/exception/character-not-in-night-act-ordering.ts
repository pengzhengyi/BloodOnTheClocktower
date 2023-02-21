import type { CharacterToken } from '../character/character';
import type { CharacterId } from '../character/character-id';
import type { NightActOrdering } from '../night-sheet';
import { RecoverableGameError } from './exception';

export class CharacterNotInNightActOrdering extends RecoverableGameError {
    static description = "character not in night sheet's acting order";

    constructor(
        readonly character: CharacterToken | CharacterId,
        readonly nightActOrdering: NightActOrdering
    ) {
        super(CharacterNotInNightActOrdering.description);
    }
}
