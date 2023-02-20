import type {
    AbilityUseContext,
    AbilityUseResult,
    IAbility,
} from '../ability/ability';
import { RecoverableGameError } from './exception';

export class AbilityRequiresSetup<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult
> extends RecoverableGameError {
    static description = 'Ability requires setup before use';

    constructor(
        readonly ability: IAbility<TAbilityUseContext, TAbilityUseResult>,
        readonly context: TAbilityUseContext
    ) {
        super(AbilityRequiresSetup.description);
    }
}
