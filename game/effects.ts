import { OrderedMap, LinkList } from 'js-sdsl';
import { Generator } from './collections';
import { Effect, EffectContext } from './effect';
import { EffectPrecedence } from './effectprecedence';
import { Pipeline } from './middleware';

export class Effects<TTarget extends object> extends Pipeline<
    EffectContext<TTarget>,
    Effect<TTarget>
> {
    protected effectToPriority: Map<Effect<TTarget>, number>;

    protected hierarchy: OrderedMap<number, LinkList<Effect<TTarget>>>;

    get size(): number {
        return this.effectToPriority.size;
    }

    constructor() {
        super([]);
        this.effectToPriority = new Map<Effect<TTarget>, number>();
        this.hierarchy = new OrderedMap<number, LinkList<Effect<TTarget>>>(
            [],
            (priority, otherPriority) => otherPriority - priority
        );
    }

    *[Symbol.iterator]() {
        for (const [_, samePriorityEffects] of this.hierarchy) {
            for (
                let effectIterator = samePriorityEffects.rBegin();
                !effectIterator.equals(samePriorityEffects.rEnd());
                effectIterator = effectIterator.next()
            ) {
                yield effectIterator.pointer;
            }
        }
    }

    add(effect: Effect<TTarget>) {
        const priority = EffectPrecedence.getPriority(effect);
        this.effectToPriority.set(effect, priority);

        let samePriorityEffects = this.hierarchy.getElementByKey(priority);

        if (samePriorityEffects === undefined) {
            samePriorityEffects = new LinkList<Effect<TTarget>>();
            this.hierarchy.setElement(priority, samePriorityEffects);
        }

        samePriorityEffects.pushBack(effect);
    }

    has(effect: Effect<TTarget>): boolean {
        return this.effectToPriority.has(effect);
    }

    delete(effect: Effect<TTarget>): boolean {
        const priority = this.effectToPriority.get(effect);

        if (priority === undefined) {
            return false;
        }

        const samePriorityEffects = this.hierarchy.getElementByKey(priority)!;
        this.effectToPriority.delete(effect);
        samePriorityEffects.eraseElementByValue(effect);

        return true;
    }

    values() {
        return this.effectToPriority.keys();
    }

    protected getApplicableMiddlewares(
        context: EffectContext<TTarget>
    ): Array<Effect<TTarget>> {
        return Array.from(
            Generator.filter((effect) => effect.isApplicable(context), this)
        );
    }
}
