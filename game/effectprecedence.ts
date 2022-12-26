import { Effect, Forwarding } from './effect';

export abstract class EffectPrecedence {
    static getPriority<TTarget extends object>(
        effect: Effect<TTarget>
    ): number {
        if (effect instanceof Forwarding) {
            return -1;
        }

        return 0;
    }

    /**
     * A function that defines the sort order, by default, it sort in ascending order or effect priority.
     *
     * @param effect An effect to sort.
     * @param otherEffect Another effect to sort.
     * @param ascending Whether higher priority effect will be sorted after lower priority effect. Default to true.
     * @returns The comparison result of two effects. If ascending, when greater than 0, then effect will be sorted after otherEffect; equal to 0, keep original order of these effects, and when less than 0, then effect will be sorted before otherEffect.
     */
    static compare<TTarget extends object>(
        effect: Effect<TTarget>,
        otherEffect: Effect<TTarget>,
        ascending = true
    ): number {
        if (ascending) {
            return this.getPriority(effect) - this.getPriority(otherEffect);
        } else {
            return this.getPriority(otherEffect) - this.getPriority(effect);
        }
    }
}
