import type {
    AbilityUseContext,
    AbilityUseResult,
    AbilitySetupContext,
    IAbility,
} from '../ability/ability';
import { RecoverableGameError } from './exception';

export class AbilityCanOnlyUseOnce<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext
> extends RecoverableGameError {
    static description = 'Ability can be used once per game';

    constructor(
        readonly ability: IAbility<
            TAbilityUseContext,
            TAbilityUseResult,
            TAbilitySetupContext
        >,
        readonly context: TAbilityUseContext
    ) {
        super(AbilityCanOnlyUseOnce.description);
    }
}
