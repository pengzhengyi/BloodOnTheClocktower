import type {
    AbilityUseContext,
    AbilityUseResult,
    AbilitySetupContext,
    IAbility,
} from '../ability/ability';
import { RecoverableGameError } from './exception';

export class AbilityRequiresSetup<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext
> extends RecoverableGameError {
    static description = 'Ability requires setup before use';

    constructor(
        readonly ability: IAbility<
            TAbilityUseContext,
            TAbilityUseResult,
            TAbilitySetupContext
        >,
        readonly context: TAbilityUseContext
    ) {
        super(AbilityRequiresSetup.description);
    }
}
