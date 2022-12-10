import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain, Type } from 'class-transformer';
import { GamePhase } from './gamephase';

@Exclude()
export class Duration {
    @Expose({ toPlainOnly: true })
    @Type(() => GamePhase)
    protected readonly start: GamePhase;

    @Expose({ toPlainOnly: true })
    @Type(() => GamePhase)
    protected readonly end: GamePhase;

    static format(start: GamePhase, end: GamePhase, compact = true): string {
        return `${start} ${compact ? '--' : 'to'} ${end}`;
    }

    get atSameDate(): boolean {
        return this.start.dateIndex === this.end.dateIndex;
    }

    get dateElapsed(): number {
        return this.end.dateIndex - this.start.dateIndex;
    }

    get phaseElapsed(): number {
        return this.end.valueOf() - this.start.valueOf();
    }

    static onePhase(start: GamePhase) {
        const end = GamePhase.of(start.valueOf() + 1);
        return new Duration(start, end);
    }

    constructor(start: GamePhase, end: GamePhase) {
        this.start = start;
        this.end = end;
    }

    toJSON() {
        return instanceToPlain(this);
    }

    toString() {
        return Duration.format(this.start, this.end);
    }

    equals(other: Duration): boolean {
        return this.start.equals(other.start) && this.end.equals(other.end);
    }
}
