import type { ISeating } from '../seating/seating';
import { RecoverableGameError } from './exception';

export class NumberOfSeatNotPositive extends RecoverableGameError {
    static description = 'The number of seats must be a positive number';

    declare correctedNumSeats: number;

    constructor(readonly seating: ISeating, readonly numSeats: number) {
        super(NumberOfSeatNotPositive.description);
        this.correctedNumSeats = numSeats;
    }
}
