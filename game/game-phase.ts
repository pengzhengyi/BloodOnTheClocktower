import '@abraham/reflection';
import { Expose, Exclude, instanceToPlain } from 'class-transformer';
import { BasicGamePhaseKind } from './game-phase-kind';
import { Phase, getPhase, getPhaseIndex, toString } from './phase';
import { Environment } from '~/interaction/environment';

export interface IGamePhase {
    /**
     * The date index of current phase. Initial setup phase and first night is at date 0, while first day is at date 1, and each subsequent day the following date.
     */
    readonly dateIndex: number;

    readonly phase: number;

    readonly cycleIndex: number;

    /**
     * {@link `glossary["First night"]`}
     * The night phase that begins the game. Some characters act only during the first night. Some characters act during each night except the first. Players may talk about their characters only after the first night.
     */
    readonly isFirstNight: boolean;

    readonly isNonfirstNight: boolean;

    readonly isDay: boolean;

    readonly isNight: boolean;

    readonly gamePhaseKind: BasicGamePhaseKind;

    forceTransition(reason?: string): Promise<boolean>;

    toJSON(): Record<string, any>;

    toString(): string;

    valueOf(): number;

    isBefore(other: IGamePhase): boolean;

    equals(other: IGamePhase): boolean;

    isAfter(other: IGamePhase): boolean;
}

@Exclude()
export class GamePhase implements IGamePhase {
    protected _phase: Phase;

    /**
     * The index of current phase. Initial setup phase will has index 0 while first night has index 1.
     */
    @Expose({ toPlainOnly: true })
    protected phaseCounter: number;

    get dateIndex(): number {
        return Math.floor((this.phaseCounter + 2) / 4);
    }

    get phase(): Phase {
        return this._phase;
    }

    get cycleIndex(): number {
        return Math.max(Math.floor((this.phaseCounter - 1) / 4), 0);
    }

    get isFirstNight(): boolean {
        return this._phase === Phase.Night && this.cycleIndex === 0;
    }

    get isNonfirstNight(): boolean {
        return this._phase === Phase.Night && this.cycleIndex !== 0;
    }

    get isDay(): boolean {
        return this._phase === Phase.Day;
    }

    get isNight(): boolean {
        return this._phase === Phase.Night;
    }

    get gamePhaseKind(): BasicGamePhaseKind {
        if (this.isFirstNight) {
            return BasicGamePhaseKind.FirstNight;
        }

        if (this.isNonfirstNight) {
            return BasicGamePhaseKind.NonfirstNight;
        }

        return BasicGamePhaseKind.Other;
    }

    static format(phase: Phase, cycleIndex: number): string {
        return `${toString(phase)} ${cycleIndex}`;
    }

    static setup() {
        return this.of(0);
    }

    static firstNight() {
        return this.of(1);
    }

    static of(phaseCounter: number): GamePhase {
        return new this(undefined, phaseCounter);
    }

    protected constructor(phase?: Phase, phaseCounter?: number) {
        if (phase === undefined && phaseCounter === undefined) {
            phase = Phase.Setup;
        }

        if (phase === undefined) {
            this._phase = getPhase(phaseCounter!);
        } else {
            this._phase = phase;
        }

        if (phaseCounter === undefined) {
            this.phaseCounter = getPhaseIndex(phase!);
        } else {
            this.phaseCounter = phaseCounter;
        }
    }

    async forceTransition(reason?: string): Promise<boolean> {
        reason = reason ? ` because ${reason}` : '';

        if (
            await Environment.current.gameUI.storytellerConfirm(
                `Should transition from ${this} to next phase${reason}`
            )
        ) {
            this.transition();
            return true;
        }

        return false;
    }

    toJSON() {
        return instanceToPlain(this);
    }

    toString() {
        return GamePhase.format(this._phase, this.cycleIndex);
    }

    valueOf() {
        return this.phaseCounter;
    }

    isBefore(other: GamePhase): boolean {
        return this.phaseCounter < other.phaseCounter;
    }

    equals(other: GamePhase): boolean {
        return this.phaseCounter === other.phaseCounter;
    }

    isAfter(other: GamePhase): boolean {
        return this.phaseCounter > other.phaseCounter;
    }

    protected transition() {
        let phase = this._phase << 1;
        this.phaseCounter++;
        if (phase > Phase.Dusk) {
            phase = Phase.Night;
        }

        this._phase = phase;
    }
}
