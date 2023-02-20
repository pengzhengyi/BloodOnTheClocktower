import { Generator } from '../collections';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    AbilityUseResult,
    IAbility,
} from './ability';

/**
 * IAbilities is a utility structure holding all abilities for a player. It allows convenient operations like `setup`.
 */
export interface IAbilities {
    characterAbilities: IAbility<AbilityUseContext, AbilityUseResult>[];

    characterTypeAbility:
        | IAbility<AbilityUseContext, AbilityUseResult>
        | undefined;

    // utility properties
    readonly hasCharacterAbility: boolean;
    readonly hasCharacterTypeAbility: boolean;
    readonly hasAnyAbility: boolean;

    [Symbol.iterator](): IterableIterator<
        IAbility<AbilityUseContext, AbilityUseResult>
    >;

    setup(context: AbilitySetupContext): Promise<void>;
}

export class Abilities implements IAbilities {
    static from(
        characterAbilities?: IAbility<AbilityUseContext, AbilityUseResult>[],
        characterTypeAbility?: IAbility<AbilityUseContext, AbilityUseResult>
    ): IAbilities {
        const abilities = new Abilities();

        if (characterAbilities !== undefined) {
            abilities.characterAbilities = characterAbilities;
        }

        if (characterTypeAbility !== undefined) {
            abilities.characterTypeAbility = characterTypeAbility;
        }

        return abilities;
    }

    characterAbilities: Array<IAbility<AbilityUseContext, AbilityUseResult>> =
        [];

    characterTypeAbility:
        | IAbility<AbilityUseContext, AbilityUseResult>
        | undefined;

    get hasCharacterAbility(): boolean {
        return this.characterAbilities.length > 0;
    }

    get hasCharacterTypeAbility(): boolean {
        return this.characterTypeAbility !== undefined;
    }

    get hasAnyAbility(): boolean {
        return this.hasCharacterAbility || this.hasCharacterTypeAbility;
    }

    *[Symbol.iterator](): IterableIterator<
        IAbility<AbilityUseContext, AbilityUseResult>
    > {
        yield* this.characterAbilities;
        if (this.characterTypeAbility !== undefined) {
            yield this.characterTypeAbility;
        }
    }

    async setup(context: AbilitySetupContext): Promise<void> {
        const promises = Generator.toPromise(
            (ability) => ability.setup(context),
            this
        );
        const _result = await Generator.promiseAllSettled(promises);
    }
}
