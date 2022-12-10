import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain, Type } from 'class-transformer';
import { GamePhase } from './gamephase';
import { UnsupportedOperation } from './exception';

export interface IDuration {
    atSameDate: boolean;
    dateElapsed: number;
    phaseElapsed: number;

    hasStartedAt(phase: GamePhase): boolean;

    isActiveAt(phase: GamePhase): boolean;

    hasEndedAt(phase: GamePhase): boolean;

    toJSON(): Record<string, any>;

    toString(): string;

    equals(duration: IDuration): boolean;
}

@Exclude()
export class Duration implements IDuration {
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

    hasStartedAt(phase: GamePhase): boolean {
        return phase.isAfter(this.start);
    }

    isActiveAt(phase: GamePhase): boolean {
        return this.hasStartedAt(phase) && !this.hasEndedAt(phase);
    }

    hasEndedAt(phase: GamePhase): boolean {
        return phase.isAfter(this.end);
    }

    toJSON() {
        return instanceToPlain(this);
    }

    toString() {
        return Duration.format(this.start, this.end);
    }

    equals(other: IDuration): boolean {
        if (other instanceof Duration) {
            return this.start.equals(other.start) && this.end.equals(other.end);
        } else {
            return false;
        }
    }
}

@Exclude()
export class IndefiniteDuration implements IDuration {
    @Expose({ toPlainOnly: true })
    @Type(() => GamePhase)
    protected readonly start: GamePhase;

    static DATE_ELAPSED_NOT_SUPPORTED_DESCRIPTION =
        'getting the elapsed date is not supported for an indefinite duration';

    static PHASE_ELAPSED_NOT_SUPPORTED_DESCRIPTION =
        'getting the elapsed phase is not supported for an indefinite duration';

    static format(start: GamePhase, compact = true): string {
        return `${start} ${compact ? '--' : 'to'} ?`;
    }

    get atSameDate(): boolean {
        return false;
    }

    get dateElapsed(): number {
        throw new UnsupportedOperation(
            IndefiniteDuration.DATE_ELAPSED_NOT_SUPPORTED_DESCRIPTION
        );
    }

    get phaseElapsed(): number {
        throw new UnsupportedOperation(
            IndefiniteDuration.PHASE_ELAPSED_NOT_SUPPORTED_DESCRIPTION
        );
    }

    constructor(start: GamePhase) {
        this.start = start;
    }

    setEnd(end: GamePhase): Duration {
        return new Duration(this.start, end);
    }

    hasStartedAt(phase: GamePhase): boolean {
        return phase.isAfter(this.start);
    }

    isActiveAt(phase: GamePhase): boolean {
        return this.hasStartedAt(phase) && !this.hasEndedAt(phase);
    }

    hasEndedAt(_phase: GamePhase): boolean {
        return false;
    }

    toJSON() {
        return instanceToPlain(this);
    }

    toString() {
        return IndefiniteDuration.format(this.start);
    }

    equals(other: IDuration): boolean {
        if (other instanceof IndefiniteDuration) {
            return this.start.equals(other.start);
        } else {
            return false;
        }
    }
}
