import { OrderedMap, LinkList } from 'js-sdsl';
import { Effect, EffectTarget } from './effect';
import { EffectPrecedence } from './effectprecedence';
import { AsyncPipeline } from './middleware';

export class Effects<T = EffectTarget> extends AsyncPipeline<T> {
    protected effectToPriority: Map<Effect<T>, number>;

    protected hierarchy: OrderedMap<number, LinkList<Effect<T>>>;

    private shouldUpdatePipeline = false;

    #middlewares: Array<Effect<T>> = [];

    get size(): number {
        return this.effectToPriority.size;
    }

    protected get middlewares(): Array<Effect<T>> {
        if (this.shouldUpdatePipeline) {
            this.#middlewares = Array.from(this.getActiveEffects());
            this.shouldUpdatePipeline = false;
        }

        return this.#middlewares;
    }

    constructor() {
        super([]);
        this.effectToPriority = new Map<Effect<T>, number>();
        this.hierarchy = new OrderedMap<number, LinkList<Effect<T>>>(
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

    *getActiveEffects() {
        for (const effect of this) {
            if (effect.active) {
                yield effect;
            }
        }
    }

    add(effect: Effect<T>) {
        const priority = EffectPrecedence.getPriority(effect);
        this.effectToPriority.set(effect, priority);

        let samePriorityEffects = this.hierarchy.getElementByKey(priority);

        if (samePriorityEffects === undefined) {
            samePriorityEffects = new LinkList<Effect<T>>();
            this.hierarchy.setElement(priority, samePriorityEffects);
        }

        samePriorityEffects.pushBack(effect);
        this.shouldUpdatePipeline = true;
    }

    has(effect: Effect<T>): boolean {
        return this.effectToPriority.has(effect);
    }

    delete(effect: Effect<T>): boolean {
        const priority = this.effectToPriority.get(effect);

        if (priority === undefined) {
            return false;
        }

        const samePriorityEffects = this.hierarchy.getElementByKey(priority)!;
        this.effectToPriority.delete(effect);
        samePriorityEffects.eraseElementByValue(effect);
        this.shouldUpdatePipeline = true;

        return true;
    }

    values() {
        return this.effectToPriority.keys();
    }
}
