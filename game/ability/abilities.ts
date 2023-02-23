import { Generator } from '../collections';
import type { IGameEnvironment } from '../environment';
import type { IGame } from '../game';
import type { IPlayer } from '../player';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    AbilityUseResult,
    IAbility,
} from './ability';
import type { IAbilityGroup } from './ability-group';

/**
 * IAbilities is a utility structure holding all abilities for a player. It allows convenient operations like `setup`.
 */
export interface IAbilities extends IAbilityGroup {
    // utility properties
    readonly hasCharacterAbility: boolean;
    readonly hasCharacterTypeAbility: boolean;
    readonly hasAnyAbility: boolean;

    [Symbol.iterator](): IterableIterator<
        IAbility<AbilityUseContext, AbilityUseResult>
    >;

    setup(
        abilityOwner: IPlayer,
        game: IGame,
        gameEnvironment: IGameEnvironment
    ): Promise<void>;

    assign(abilities: IAbilityGroup): this;
}

export class Abilities implements IAbilities {
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

    async setup(
        abilityOwner: IPlayer,
        game: IGame,
        gameEnvironment: IGameEnvironment
    ): Promise<void> {
        const promises = Generator.toPromise(async (ability) => {
            const context: AbilitySetupContext =
                await ability.createSetupContext(
                    abilityOwner,
                    game,
                    gameEnvironment
                );
            const _setupResult = await ability.setup(context);
        }, this);
        const _result = await Generator.promiseAllSettled(promises);
    }

    assign(abilities: IAbilityGroup) {
        if (abilities.characterAbilities !== undefined) {
            this.characterAbilities = abilities.characterAbilities;
        }

        if (abilities.characterTypeAbility !== undefined) {
            this.characterTypeAbility = abilities.characterTypeAbility;
        }

        return this;
    }
}
