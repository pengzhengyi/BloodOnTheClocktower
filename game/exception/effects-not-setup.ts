import type { IEffects } from '../effect/effects';
import { RecoverableGameError } from './exception';

export class EffectsNotSetup<
    TTarget extends object,
    TGetPriorityContext = any
> extends RecoverableGameError {
    static description =
        'Effects has not setup game phase based priority ordering';

    constructor(readonly effects: IEffects<TTarget, TGetPriorityContext>) {
        super(EffectsNotSetup.description);
    }
}
