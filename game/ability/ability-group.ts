import type { IAbility, AbilityUseContext, AbilityUseResult } from './ability';

export interface IAbilityGroup {
    characterAbilities: IAbility<AbilityUseContext, AbilityUseResult>[];

    characterTypeAbility:
        | IAbility<AbilityUseContext, AbilityUseResult>
        | undefined;
}
