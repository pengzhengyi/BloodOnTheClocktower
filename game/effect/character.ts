import type { CharacterToken } from '../character';
import { CharacterEffectOriginNotSetup } from '../exception';
import type { NightSheet } from '../night-sheet';
import type { NextFunction } from '../proxy/middleware';
import type { Constructor } from '../types';
import type { Effect, InteractionContext } from './effect';

interface WithOrigin {
    origin: CharacterToken;
}

export type TCharacterEffect<TTarget extends object> = Effect<TTarget> &
    WithOrigin;

interface TCharacterEffectConstructor<TTarget extends object>
    extends Constructor<Effect<TTarget>>,
        WithOrigin {}

export function CharacterEffect<
    TTarget extends object,
    TEffectConstructor extends TCharacterEffectConstructor<TTarget>
>(effectConstructor: TEffectConstructor) {
    return class CharacterEffect
        extends effectConstructor
        implements TCharacterEffect<TTarget>
    {
        declare static readonly origin: CharacterToken;

        apply(
            context: InteractionContext<TTarget>,
            next: NextFunction<InteractionContext<TTarget>>
        ): InteractionContext<TTarget> {
            return super.apply(context, next);
        }

        get origin(): CharacterToken {
            const origin = (this.constructor as any).origin;
            if (origin === undefined) {
                throw new CharacterEffectOriginNotSetup(this);
            }

            return origin;
        }
    };
}

export function CharacterNightEffect<
    TTarget extends object,
    TEffectConstructor extends TCharacterEffectConstructor<TTarget>
>(effectConstructor: TEffectConstructor) {
    return class CharacterNightEffect extends CharacterEffect(
        effectConstructor
    ) {
        protected firstNightPriority?: number;

        protected otherNightPriority?: number;

        apply(
            context: InteractionContext<TTarget>,
            next: NextFunction<InteractionContext<TTarget>>
        ): InteractionContext<TTarget> {
            return super.apply(context, next);
        }

        setup(nightSheet: NightSheet): [number, number] {
            return this.setupNightPriority(nightSheet);
        }

        protected setupNightPriority(nightSheet: NightSheet): [number, number] {
            this.firstNightPriority = nightSheet.getNightPriority(
                this.origin,
                true
            );
            this.otherNightPriority = nightSheet.getNightPriority(
                this.origin,
                false
            );

            return [this.firstNightPriority, this.otherNightPriority];
        }

        protected getPriorityForFirstNightGamePhaseKind(): number {
            return (
                this.firstNightPriority ??
                super.getPriorityForFirstNightGamePhaseKind()
            );
        }

        protected getPriorityForNonfirstNightGamePhaseKind(): number {
            return (
                this.otherNightPriority ??
                super.getPriorityForNonfirstNightGamePhaseKind()
            );
        }
    };
}
