import { OrderedMap, LinkList } from 'js-sdsl';
import { Effect } from './effect';
import { EffectPrecedence } from './effectprecedence';

export class Effects {
    protected effectToPriority: Map<Effect, number>;

    protected hierarchy: OrderedMap<number, LinkList<Effect>>;

    get size(): number {
        return this.effectToPriority.size;
    }

    constructor() {
        this.effectToPriority = new Map<Effect, number>();
        this.hierarchy = new OrderedMap<number, LinkList<Effect>>();
    }

    *getActiveEffects() {
        for (const effect of this) {
            if (effect.active) {
                yield effect;
            }
        }
    }

    *[Symbol.iterator]() {
        for (
            let iterator = this.hierarchy.rBegin();
            !iterator.equals(this.hierarchy.rEnd());
            iterator = iterator.next()
        ) {
            const samePriorityEffects = iterator.pointer[1];
            for (
                let effectIterator = samePriorityEffects.rBegin();
                !effectIterator.equals(samePriorityEffects.rEnd());
                effectIterator = effectIterator.next()
            ) {
                yield effectIterator.pointer;
            }
        }
    }

    add(effect: Effect) {
        const priority = EffectPrecedence.getPriority(effect);
        this.effectToPriority.set(effect, priority);

        let samePriorityEffects = this.hierarchy.getElementByKey(priority);

        if (samePriorityEffects === undefined) {
            samePriorityEffects = new LinkList<Effect>();
            this.hierarchy.setElement(priority, samePriorityEffects);
        }

        samePriorityEffects.pushBack(effect);
    }

    has(effect: Effect): boolean {
        return this.effectToPriority.has(effect);
    }

    delete(effect: Effect): boolean {
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
}
