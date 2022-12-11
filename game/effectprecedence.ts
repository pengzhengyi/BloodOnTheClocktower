import { Effect, EffectTarget } from './effect';

export abstract class EffectPrecedence {
    static getPriority<T = EffectTarget>(_effect: Effect<T>): number {
        return 0;
    }

    static compare<T = EffectTarget>(
        _effect: Effect<T>,
        _otherEffect: Effect<T>
    ): number {
        return 0;
    }
}
