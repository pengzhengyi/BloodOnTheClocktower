import type { ISeating } from '../seating/seating';
import { RecoverableGameError } from './exception';

export class AccessInvalidSeatPosition extends RecoverableGameError {
    static description = 'Cannot get seat for an invalid position';

    constructor(readonly position: number, readonly seating: ISeating) {
        super(AccessInvalidSeatPosition.description);
    }
}
