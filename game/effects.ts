import { OrderedMap, LinkList } from 'js-sdsl';
import { Generator, LazyMap } from './collections';
import { Effect, Forwarding, InteractionContext } from './effect';
import { EffectsNotSetup } from './exception';
import { ALL_GAME_PHASE_KINDS, GamePhase, GamePhaseKind } from './gamephase';
import { Pipeline } from './middleware';
import type { Transform } from './types';

abstract class AbstractGamePhaseBased<
    TGamePhaseKind,
    V,
    T extends TGamePhaseKind[] = TGamePhaseKind[]
> extends LazyMap<TGamePhaseKind, V> {
    abstract isGamePhaseKind(gamePhaseKind: unknown): boolean;

    abstract getGamePhaseKinds(): T;

    abstract getGamePhaseKind(gamePhase: GamePhase): TGamePhaseKind;

    get(key: TGamePhaseKind | GamePhase): V {
        if (!this.isGamePhaseKind(key)) {
            key = this.getGamePhaseKind(key as GamePhase);
        }

        return super.get(key as TGamePhaseKind)!;
    }

    setAll(computeValue: Transform<TGamePhaseKind, V>) {
        for (const gamePhaseKind of this.getGamePhaseKinds()) {
            const value = computeValue(gamePhaseKind);
            this.set(gamePhaseKind, value);
        }

        return this;
    }

    forEvery(action: (gamePhaseKind: TGamePhaseKind, value: V) => void) {
        for (const gamePhaseKind of this.getGamePhaseKinds()) {
            const value = this.get(gamePhaseKind);
            action(gamePhaseKind, value);
        }

        return this;
    }
}

class GamePhaseBased<V> extends AbstractGamePhaseBased<GamePhaseKind, V> {
    isGamePhaseKind(gamePhaseKind: any): boolean {
        return gamePhaseKind in GamePhaseKind;
    }

    getGamePhaseKinds() {
        return ALL_GAME_PHASE_KINDS;
    }

    getGamePhaseKind(gamePhase: GamePhase) {
        if (gamePhase.isFirstNight) {
            return GamePhaseKind.FirstNight;
        }

        if (gamePhase.isNonfirstNight) {
            return GamePhaseKind.NonfirstNight;
        }

        return GamePhaseKind.Other;
    }
}

export class Effects<TTarget extends object> extends Pipeline<
    InteractionContext<TTarget>,
    Effect<TTarget>
> {
    static gamePhase: GamePhase;

    static init<TTarget extends object>(enableForwarding = true) {
        const effects = new this<TTarget>();

        if (enableForwarding) {
            effects.add(Forwarding.instance<TTarget>());
        }

        return effects;
    }

    get size(): number {
        return this.effectToPriority.size;
    }

    protected effectToPriority: Map<Effect<TTarget>, GamePhaseBased<number>>;

    protected hierarchy: GamePhaseBased<
        OrderedMap<number, LinkList<Effect<TTarget>>>
    >;

    protected get gamePhase(): GamePhase {
        const gamePhase = Effects.gamePhase;

        if (Effects.gamePhase === undefined) {
            throw new EffectsNotSetup(this);
        }

        return gamePhase;
    }

    protected constructor() {
        super([]);
        this.effectToPriority = new Map();
        this.hierarchy = new GamePhaseBased(
            (_) =>
                new OrderedMap(
                    [],
                    (priority, otherPriority) => otherPriority - priority
                )
        );
    }

    *[Symbol.iterator]() {
        if (this.size === 0) {
            return;
        }

        for (const [_, samePriorityEffects] of this.hierarchy.get(
            this.gamePhase
        )) {
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
        this.effectToPriority.set(
            effect,
            new GamePhaseBased((gamePhaseKind) =>
                this.getPriority(effect, gamePhaseKind)
            )
        );

        this.hierarchy.forEvery((gamePhaseKind, priorityToEffects) => {
            const priority = this.getPriority(effect, gamePhaseKind);
            let samePriorityEffects =
                priorityToEffects.getElementByKey(priority);

            if (samePriorityEffects === undefined) {
                samePriorityEffects = new LinkList<Effect<TTarget>>();
                priorityToEffects.setElement(priority, samePriorityEffects);
            }

            samePriorityEffects.pushBack(effect);
        });
    }

    has(effect: Effect<TTarget>): boolean {
        return this.effectToPriority.has(effect);
    }

    delete(effect: Effect<TTarget>): boolean {
        const priority = this.effectToPriority.get(effect);

        if (priority === undefined) {
            return false;
        }

        this.effectToPriority.delete(effect);

        this.hierarchy.forEvery((gamePhaseKind, priorityToEffects) => {
            const priority = this.getPriority(effect, gamePhaseKind);
            const samePriorityEffects =
                priorityToEffects.getElementByKey(priority)!;
            samePriorityEffects.eraseElementByValue(effect);
        });

        return true;
    }

    values() {
        return this.effectToPriority.keys();
    }

    protected getApplicableMiddlewares(
        context: InteractionContext<TTarget>
    ): Array<Effect<TTarget>> {
        return Array.from(
            Generator.filter((effect) => effect.isApplicable(context), this)
        );
    }

    protected getPriority(
        effect: Effect<TTarget>,
        gamePhaseKind: GamePhaseKind
    ) {
        return effect.getPriority(gamePhaseKind);
    }
}
