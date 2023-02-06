import type { IStoryTeller } from '../storyteller';
import { RecoverableGameError } from './exception';

export class BlankGrimoire extends RecoverableGameError {
    static description = "Storyteller's grimoire is not initialized";

    constructor(readonly storyteller: IStoryTeller) {
        super(BlankGrimoire.description);
    }
}
