import { Effect } from './effect';

export abstract class EffectPrecedence {
    static getPriority(_effect: Effect): number {
        return 0;
    }

    static compare(_effect: Effect, _otherEffect: Effect): number {
        return 0;
    }
}
