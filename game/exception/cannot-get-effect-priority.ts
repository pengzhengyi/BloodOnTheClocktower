import type { IEffect } from '../effect/effect';
import type { GamePhaseKind } from '../game-phase-kind';
import { RecoverableGameError } from './exception';

export class CannotGetEffectPriority<
    T extends object
> extends RecoverableGameError {
    static description =
        'Cannot get priority of an effect for specified game phase';

    constructor(
        readonly effect: IEffect<T>,
        readonly gamePhaseKind: GamePhaseKind
    ) {
        super(CannotGetEffectPriority.description);
    }
}
