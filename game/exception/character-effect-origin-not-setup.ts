import type { TCharacterEffect } from '../effect/character';
import { RecoverableGameError } from './exception';

export class CharacterEffectOriginNotSetup<
    TTarget extends object
> extends RecoverableGameError {
    static description =
        'Character effect has not setup its effect origin (the character that applied this effect)';

    constructor(readonly effect: TCharacterEffect<TTarget>) {
        super(CharacterEffectOriginNotSetup.description);
    }
}
