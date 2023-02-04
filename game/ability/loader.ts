/* eslint-disable no-dupe-class-members */
import type { CharacterToken } from '../character';
import { Generator } from '../collections';
import type { Constructor } from '../types';
import { type CharacterType, Demon, Minion } from '../character-type';
import { ButlerAbility } from './butler';
import { GetChefInformationAbility } from './chef';
import { GetEmpathInformationAbility } from './empath';
import { GetFortuneTellerInformationAbility } from './fortuneteller';
import { GetInvestigatorInformationAbility } from './investigator';
import { GetLibrarianInformationAbility } from './librarian';
import { MayorAbility } from './mayor';
import { MonkProtectAbility } from './monk';
import { GetRavenkeeperInformationAbility } from './ravenkeeper';
import { RecluseAbility } from './recluse';
import { SaintAbility } from './saint';
import { SlayerAbility } from './slayer';
import { SoldierAbility } from './soldier';
import { GetUndertakerInformationAbility } from './undertaker';
import { VirginAbility } from './virgin';
import { GetWasherwomanInformationAbility } from './washerwoman';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    AbilityUseResult,
    IAbility,
    ICharacterAbilityClass,
    ICharacterTypeAbilityClass,
} from './ability';
import { DrunkAbility } from './drunk';
import { PoisonerAbility } from './poisoner';
import { GetMinionInformationAbility } from './minion';
import { GetDemonInformationAbility } from './demon';
import { Butler } from '~/content/characters/output/butler';
import { Chef } from '~/content/characters/output/chef';
import { Empath } from '~/content/characters/output/empath';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Investigator } from '~/content/characters/output/investigator';
import { Librarian } from '~/content/characters/output/librarian';
import { Mayor } from '~/content/characters/output/mayor';
import { Monk } from '~/content/characters/output/monk';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Recluse } from '~/content/characters/output/recluse';
import { Saint } from '~/content/characters/output/saint';
import { Slayer } from '~/content/characters/output/slayer';
import { Soldier } from '~/content/characters/output/soldier';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Virgin } from '~/content/characters/output/virgin';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Drunk } from '~/content/characters/output/drunk';
import { Poisoner } from '~/content/characters/output/poisoner';

export interface IAbilityLoader {
    load(
        character: CharacterToken
    ): Array<
        Constructor<
            IAbility<AbilityUseContext, AbilityUseResult, AbilitySetupContext>
        >
    >;

    /**
     *
     */
    loadCharacterAbility(
        character: CharacterToken
    ):
        | ICharacterAbilityClass<
              AbilityUseContext,
              AbilityUseResult,
              AbilitySetupContext
          >
        | undefined;
}

const CharacterAbilityClasses: Array<
    ICharacterAbilityClass<
        AbilityUseContext,
        AbilityUseResult,
        AbilitySetupContext
    >
> = [
    class extends GetWasherwomanInformationAbility {
        static origin: CharacterToken = Washerwoman;
    },
    class extends GetLibrarianInformationAbility {
        static origin: CharacterToken = Librarian;
    },
    class extends GetInvestigatorInformationAbility {
        static origin: CharacterToken = Investigator;
    },
    class extends GetChefInformationAbility {
        static origin: CharacterToken = Chef;
    },
    class extends GetEmpathInformationAbility {
        static origin: CharacterToken = Empath;
    },
    class extends GetFortuneTellerInformationAbility {
        static origin: CharacterToken = FortuneTeller;
    },
    class extends GetUndertakerInformationAbility {
        static origin: CharacterToken = Undertaker;
    },
    class extends MonkProtectAbility {
        static origin: CharacterToken = Monk;
    },
    class extends GetRavenkeeperInformationAbility {
        static origin: CharacterToken = Ravenkeeper;
    },
    class extends VirginAbility {
        static origin: CharacterToken = Virgin;
    },
    class extends SlayerAbility {
        static origin: CharacterToken = Slayer;
    },
    class extends SoldierAbility {
        static origin: CharacterToken = Soldier;
    },
    class extends MayorAbility {
        static origin: CharacterToken = Mayor;
    },
    class extends ButlerAbility {
        static origin: CharacterToken = Butler;
    },
    class extends DrunkAbility {
        static origin: CharacterToken = Drunk;
    },
    class extends RecluseAbility {
        static origin: CharacterToken = Recluse;
    },
    class extends SaintAbility {
        static origin: CharacterToken = Saint;
    },
    class extends PoisonerAbility {
        static origin: CharacterToken = Poisoner;
    },
];

const CharacterTypeAbilityClasses: Array<
    ICharacterTypeAbilityClass<
        AbilityUseContext,
        AbilityUseResult,
        AbilitySetupContext
    >
> = [
    class extends GetMinionInformationAbility {
        static origin: typeof CharacterType = Minion;
    },
    class extends GetDemonInformationAbility {
        static origin: typeof CharacterType = Demon;
    },
];

export class AbilityLoader implements IAbilityLoader {
    static characterToAbility: Map<
        CharacterToken,
        ICharacterAbilityClass<
            AbilityUseContext,
            AbilityUseResult,
            AbilitySetupContext
        >
    > = new Map(
        Generator.map(
            (CharacterAbilityClass) => [
                CharacterAbilityClass.origin,
                CharacterAbilityClass,
            ],
            CharacterAbilityClasses
        )
    );

    static characterTypeToAbility: Map<
        typeof CharacterType,
        ICharacterTypeAbilityClass<
            AbilityUseContext,
            AbilityUseResult,
            AbilitySetupContext
        >
    > = new Map(
        Generator.map(
            (CharacterTypeAbilityClass) => [
                CharacterTypeAbilityClass.origin,
                CharacterTypeAbilityClass,
            ],
            CharacterTypeAbilityClasses
        )
    );

    load(
        character: typeof Washerwoman
    ): [typeof GetWasherwomanInformationAbility];

    load(character: typeof Librarian): [typeof GetLibrarianInformationAbility];
    load(
        character: typeof Investigator
    ): [typeof GetInvestigatorInformationAbility];

    load(character: typeof Chef): [typeof GetChefInformationAbility];
    load(character: typeof Empath): [typeof GetEmpathInformationAbility];
    load(
        character: typeof FortuneTeller
    ): [typeof GetFortuneTellerInformationAbility];

    load(
        character: typeof Undertaker
    ): [typeof GetUndertakerInformationAbility];

    load(character: typeof Monk): [typeof MonkProtectAbility];
    load(
        character: typeof Ravenkeeper
    ): [typeof GetRavenkeeperInformationAbility];

    load(character: typeof Virgin): [typeof VirginAbility];
    load(character: typeof Slayer): [typeof SlayerAbility];
    load(character: typeof Soldier): [typeof SoldierAbility];
    load(character: typeof Mayor): [typeof MayorAbility];
    load(character: typeof Butler): [typeof ButlerAbility];
    load(character: typeof Drunk): [typeof DrunkAbility];
    load(character: typeof Recluse): [typeof RecluseAbility];
    load(character: typeof Saint): [typeof SaintAbility];
    load(character: typeof Poisoner): [typeof PoisonerAbility];

    load(
        character: CharacterToken
    ): Array<
        Constructor<
            IAbility<AbilityUseContext, AbilityUseResult, AbilitySetupContext>
        >
    > {
        const abilities = [];

        const characterAbility = this.loadCharacterAbility(character);
        if (characterAbility !== undefined) {
            abilities.push(characterAbility);
        }
        const characterTypeAbility = this.loadCharacterTypeAbility(character);
        if (characterTypeAbility !== undefined) {
            abilities.push(characterTypeAbility);
        }

        return abilities;
    }

    loadCharacterAbility(character: CharacterToken) {
        return AbilityLoader.characterToAbility.get(character);
    }

    loadCharacterTypeAbility(character: CharacterToken) {
        return AbilityLoader.characterTypeToAbility.get(
            character.characterType
        );
    }
}
