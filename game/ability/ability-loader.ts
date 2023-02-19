/* eslint-disable lines-between-class-members */
/* eslint-disable no-dupe-class-members */
import { Generator } from '../collections';
import type { Constructor } from '../types';
import { type CharacterType, Demon, Minion } from '../character/character-type';
import type { CharacterId } from '../character/character-id';
import { CharacterIds } from '../character/character-id';
import type { ICharacterLoader } from '../character/character-loader';
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
import type { CHARACTERS } from '~/content/characters/output/characters';

export interface IAbilityLoader {
    load(
        characterId: CharacterId
    ): Array<
        Constructor<
            IAbility<AbilityUseContext, AbilityUseResult, AbilitySetupContext>
        >
    >;

    /**
     * Load ability related to character.
     */
    loadCharacterAbility(
        characterId: CharacterId
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
        static origin: CharacterId = CharacterIds.Washerwoman;
    },
    class extends GetLibrarianInformationAbility {
        static origin: CharacterId = CharacterIds.Librarian;
    },
    class extends GetInvestigatorInformationAbility {
        static origin: CharacterId = CharacterIds.Investigator;
    },
    class extends GetChefInformationAbility {
        static origin: CharacterId = CharacterIds.Chef;
    },
    class extends GetEmpathInformationAbility {
        static origin: CharacterId = CharacterIds.Empath;
    },
    class extends GetFortuneTellerInformationAbility {
        static origin: CharacterId = CharacterIds.FortuneTeller;
    },
    class extends GetUndertakerInformationAbility {
        static origin: CharacterId = CharacterIds.Undertaker;
    },
    class extends MonkProtectAbility {
        static origin: CharacterId = CharacterIds.Monk;
    },
    class extends GetRavenkeeperInformationAbility {
        static origin: CharacterId = CharacterIds.Ravenkeeper;
    },
    class extends VirginAbility {
        static origin: CharacterId = CharacterIds.Virgin;
    },
    class extends SlayerAbility {
        static origin: CharacterId = CharacterIds.Slayer;
    },
    class extends SoldierAbility {
        static origin: CharacterId = CharacterIds.Soldier;
    },
    class extends MayorAbility {
        static origin: CharacterId = CharacterIds.Mayor;
    },
    class extends ButlerAbility {
        static origin: CharacterId = CharacterIds.Butler;
    },
    class extends DrunkAbility {
        static origin: CharacterId = CharacterIds.Drunk;
    },
    class extends RecluseAbility {
        static origin: CharacterId = CharacterIds.Recluse;
    },
    class extends SaintAbility {
        static origin: CharacterId = CharacterIds.Saint;
    },
    class extends PoisonerAbility {
        static origin: CharacterId = CharacterIds.Poisoner;
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
        CharacterId,
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

    // eslint-disable-next-line no-useless-constructor
    constructor(protected readonly characterLoader: ICharacterLoader) {}

    load(
        characterId: CHARACTERS.Washerwoman
    ): [typeof GetWasherwomanInformationAbility];

    load(
        characterId: CHARACTERS.Librarian
    ): [typeof GetLibrarianInformationAbility];
    load(
        characterId: CHARACTERS.Investigator
    ): [typeof GetInvestigatorInformationAbility];
    load(characterId: CHARACTERS.Chef): [typeof GetChefInformationAbility];
    load(characterId: CHARACTERS.Empath): [typeof GetEmpathInformationAbility];
    load(
        characterId: CHARACTERS.FortuneTeller
    ): [typeof GetFortuneTellerInformationAbility];
    load(
        characterId: CHARACTERS.Undertaker
    ): [typeof GetUndertakerInformationAbility];
    load(characterId: CHARACTERS.Monk): [typeof MonkProtectAbility];
    load(
        characterId: CHARACTERS.Ravenkeeper
    ): [typeof GetRavenkeeperInformationAbility];
    load(characterId: CHARACTERS.Virgin): [typeof VirginAbility];
    load(characterId: CHARACTERS.Slayer): [typeof SlayerAbility];
    load(characterId: CHARACTERS.Soldier): [typeof SoldierAbility];
    load(characterId: CHARACTERS.Mayor): [typeof MayorAbility];
    load(characterId: CHARACTERS.Butler): [typeof ButlerAbility];
    load(characterId: CHARACTERS.Drunk): [typeof DrunkAbility];
    load(characterId: CHARACTERS.Recluse): [typeof RecluseAbility];
    load(characterId: CHARACTERS.Saint): [typeof SaintAbility];
    load(characterId: CHARACTERS.Poisoner): [typeof PoisonerAbility];
    load(
        characterId: CharacterId
    ): Array<
        Constructor<
            IAbility<AbilityUseContext, AbilityUseResult, AbilitySetupContext>
        >
    > {
        const abilities = [];

        const characterAbility = this.loadCharacterAbility(characterId);
        if (characterAbility !== undefined) {
            abilities.push(characterAbility);
        }
        const characterTypeAbility = this.loadCharacterTypeAbility(characterId);
        if (characterTypeAbility !== undefined) {
            abilities.push(characterTypeAbility);
        }

        return abilities;
    }

    loadCharacterAbility(characterId: CharacterId) {
        return AbilityLoader.characterToAbility.get(characterId);
    }

    loadCharacterTypeAbility(characterId: CharacterId) {
        const character = this.characterLoader.load(characterId);
        const characterType = character.characterType;
        return AbilityLoader.characterTypeToAbility.get(characterType);
    }
}
