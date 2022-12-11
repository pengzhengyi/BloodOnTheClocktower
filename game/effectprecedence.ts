import { Effect, EffectContext } from './effect';

export abstract class EffectPrecedence {
    static getPriority<T = EffectContext>(_effect: Effect<T>): number {
        return 0;
    }

    static compare<T = EffectContext>(
        _effect: Effect<T>,
        _otherEffect: Effect<T>
    ): number {
        return 0;
    }
}
