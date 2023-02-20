import type {
    AbilityUseContext,
    AbilityUseResult,
    IAbility,
} from '../ability/ability';
import { RecoverableGameError } from './exception';

export class AbilityCanOnlyUseOnce<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult
> extends RecoverableGameError {
    static description = 'Ability can be used once per game';

    constructor(
        readonly ability: IAbility<TAbilityUseContext, TAbilityUseResult>,
        readonly context: TAbilityUseContext
    ) {
        super(AbilityCanOnlyUseOnce.description);
    }
}
