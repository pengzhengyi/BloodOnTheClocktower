import { Effect } from './effect';

export abstract class EffectPrecedence {
    static getPriority<TTarget extends object>(
        _effect: Effect<TTarget>
    ): number {
        return 0;
    }

    static compare<TTarget extends object>(
        _effect: Effect<TTarget>,
        _otherEffect: Effect<TTarget>
    ): number {
        return 0;
    }
}
