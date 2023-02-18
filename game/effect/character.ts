import type { CharacterId } from '../character/character-id';
import { GameEnvironment } from '../environment';
import { CharacterEffectOriginNotSetup } from '../exception/character-effect-origin-not-setup';
import type { NightSheet } from '../night-sheet';
import type { Constructor, IBindToCharacter } from '../types';
import type { Effect } from './effect';

export type TCharacterEffect<TTarget extends object> = Effect<TTarget> &
    IBindToCharacter;

interface TCharacterEffectConstructor<TTarget extends object>
    extends Constructor<Effect<TTarget>>,
        IBindToCharacter {}

export function CharacterEffect<
    TTarget extends object,
    TEffectConstructor extends TCharacterEffectConstructor<TTarget>
>(effectConstructor: TEffectConstructor) {
    return class CharacterEffect
        extends effectConstructor
        implements TCharacterEffect<TTarget>
    {
        declare static readonly origin: CharacterId;

        get origin(): CharacterId {
            const origin = (this.constructor as unknown as IBindToCharacter)
                .origin;
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

        setupPriority(nightSheet: NightSheet): [number, number] {
            return this.setupNightPriority(nightSheet);
        }

        protected setupNightPriority(nightSheet: NightSheet): [number, number] {
            const character = GameEnvironment.current.loadCharacter(
                this.origin
            );
            this.firstNightPriority = nightSheet.getNightPriority(
                character,
                true
            );
            this.otherNightPriority = nightSheet.getNightPriority(
                character,
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
