import { OrderedMap, LinkList } from 'js-sdsl';
import { Generator, LazyMap } from '../collections';
import { EffectsNotSetup } from '../exception';
import { GamePhase } from '../game-phase';
import {
    ALL_GAME_PHASE_KINDS,
    BasicGamePhaseKind,
    CompositeGamePhaseKind,
    GamePhaseKind,
} from '../game-phase-kind';
import { IPipeline, Pipeline } from '../proxy/pipeline';
import type { Transform } from '../types';
import type { IEffect, InteractionContext } from './effect';
import { Forwarding } from './forwarding';

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

class GamePhaseBased<V> extends AbstractGamePhaseBased<BasicGamePhaseKind, V> {
    isGamePhaseKind(gamePhaseKind: any): boolean {
        return gamePhaseKind in BasicGamePhaseKind;
    }

    getGamePhaseKinds() {
        return ALL_GAME_PHASE_KINDS;
    }

    getGamePhaseKind(gamePhase: GamePhase) {
        if (gamePhase.isFirstNight) {
            return BasicGamePhaseKind.FirstNight;
        }

        if (gamePhase.isNonfirstNight) {
            return BasicGamePhaseKind.NonfirstNight;
        }

        return BasicGamePhaseKind.Other;
    }
}

export interface IEffects<TTarget extends object, TGetPriorityContext = any>
    extends IPipeline<InteractionContext<TTarget>>,
        Iterable<IEffect<TTarget, TGetPriorityContext>> {
    readonly size: number;

    add(
        effect: IEffect<TTarget, TGetPriorityContext>,
        priorityContext: TGetPriorityContext
    ): void;

    has(effect: IEffect<TTarget, TGetPriorityContext>): boolean;

    delete(effect: IEffect<TTarget, TGetPriorityContext>): boolean;
}

export class Effects<TTarget extends object>
    extends Pipeline<
        InteractionContext<TTarget>,
        IEffect<TTarget, BasicGamePhaseKind>
    >
    implements IEffects<TTarget, BasicGamePhaseKind>
{
    static gamePhase: GamePhase;

    get size(): number {
        return this.effectToPriority.size;
    }

    protected effectToPriority: Map<
        IEffect<TTarget, BasicGamePhaseKind>,
        GamePhaseBased<number>
    >;

    protected hierarchy: GamePhaseBased<
        OrderedMap<number, LinkList<IEffect<TTarget, BasicGamePhaseKind>>>
    >;

    protected get gamePhase(): GamePhase {
        const gamePhase = Effects.gamePhase;

        if (Effects.gamePhase === undefined) {
            throw new EffectsNotSetup(this);
        }

        return gamePhase;
    }

    constructor(enableForwarding = true) {
        super([]);
        this.effectToPriority = new Map();
        this.hierarchy = new GamePhaseBased(
            (_) =>
                new OrderedMap(
                    [],
                    (priority, otherPriority) => otherPriority - priority
                )
        );

        if (enableForwarding) {
            this.addForwardingFallback();
        }
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

    add(
        effect: IEffect<TTarget, BasicGamePhaseKind>,
        gamePhaseKind: GamePhaseKind
    ) {
        this.effectToPriority.set(
            effect,
            new GamePhaseBased((gamePhaseKind) =>
                this.getPriority(effect, gamePhaseKind)
            )
        );

        if (gamePhaseKind === CompositeGamePhaseKind.ALL) {
            this.hierarchy.forEvery((gamePhaseKind, priorityToEffects) =>
                this.addEffectToPriorityStack(
                    effect,
                    gamePhaseKind,
                    priorityToEffects
                )
            );
        } else {
            const gamePhaseKinds = (
                gamePhaseKind === CompositeGamePhaseKind.EveryNight
                    ? [
                          BasicGamePhaseKind.FirstNight,
                          BasicGamePhaseKind.NonfirstNight,
                      ]
                    : [gamePhaseKind]
            ) as Array<BasicGamePhaseKind>;
            for (const _gamePhaseKind of gamePhaseKinds) {
                const priorityToEffects = this.hierarchy.get(_gamePhaseKind);
                this.addEffectToPriorityStack(
                    effect,
                    _gamePhaseKind,
                    priorityToEffects
                );
            }
        }
    }

    has(effect: IEffect<TTarget, BasicGamePhaseKind>): boolean {
        return this.effectToPriority.has(effect);
    }

    delete(effect: IEffect<TTarget, BasicGamePhaseKind>): boolean {
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

    protected addEffectToPriorityStack(
        effect: IEffect<TTarget, BasicGamePhaseKind>,
        gamePhaseKind: BasicGamePhaseKind,
        priorityToEffects: OrderedMap<
            number,
            LinkList<IEffect<TTarget, BasicGamePhaseKind>>
        >
    ) {
        const priority = this.getPriority(effect, gamePhaseKind);
        let samePriorityEffects = priorityToEffects.getElementByKey(priority);

        if (samePriorityEffects === undefined) {
            samePriorityEffects = new LinkList<
                IEffect<TTarget, BasicGamePhaseKind>
            >();
            priorityToEffects.setElement(priority, samePriorityEffects);
        }

        samePriorityEffects.pushBack(effect);
    }

    protected getApplicableMiddlewares(
        context: InteractionContext<TTarget>
    ): Array<IEffect<TTarget, BasicGamePhaseKind>> {
        return Array.from(
            Generator.filter((effect) => effect.isApplicable(context), this)
        );
    }

    protected getPriority(
        effect: IEffect<TTarget, BasicGamePhaseKind>,
        gamePhaseKind: BasicGamePhaseKind
    ) {
        return effect.getPriority(gamePhaseKind);
    }

    protected addForwardingFallback() {
        this.add(Forwarding.instance<TTarget>(), CompositeGamePhaseKind.ALL);
    }
}
