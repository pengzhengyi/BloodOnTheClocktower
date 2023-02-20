import { Generator } from '../collections';
import type {
    IBindToCharacter,
    IBindToCharacterType,
    NoParamConstructor,
} from '../types';
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
import type { AbilityUseContext, AbilityUseResult, IAbility } from './ability';
import { DrunkAbility } from './drunk';
import { PoisonerAbility } from './poisoner';
import { GetMinionInformationAbility } from './minion';
import { GetDemonInformationAbility } from './demon';
import type { IAbilities } from './abilities';
import { Abilities } from './abilities';

export type ICharacterAbilityClass<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult
> = NoParamConstructor<IAbility<TAbilityUseContext, TAbilityUseResult>> &
    IBindToCharacter;

export type ICharacterTypeAbilityClass<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult
> = NoParamConstructor<IAbility<TAbilityUseContext, TAbilityUseResult>> &
    IBindToCharacterType;

export interface IAbilityLoader {
    load(characterId: CharacterId): IAbilities;

    /**
     * Load ability related to character.
     */
    loadCharacterAbility(
        characterId: CharacterId
    ): IAbility<AbilityUseContext, AbilityUseResult> | undefined;

    loadCharacterTypeAbility(
        characterType: CharacterType
    ): IAbility<AbilityUseContext, AbilityUseResult> | undefined;
}

const CharacterAbilityClasses: Array<
    ICharacterAbilityClass<AbilityUseContext, AbilityUseResult>
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
    ICharacterTypeAbilityClass<AbilityUseContext, AbilityUseResult>
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
        ICharacterAbilityClass<AbilityUseContext, AbilityUseResult>
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
        ICharacterTypeAbilityClass<AbilityUseContext, AbilityUseResult>
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

    load(characterId: CharacterId): IAbilities {
        let characterAbilities:
            | Array<IAbility<AbilityUseContext, AbilityUseResult>>
            | undefined;
        const characterAbility = this.loadCharacterAbility(characterId);
        if (characterAbility !== undefined) {
            characterAbilities = [characterAbility];
        }
        const characterTypeAbility = this.loadCharacterTypeAbility(characterId);

        const abilities = Abilities.from(
            characterAbilities,
            characterTypeAbility
        );
        return abilities;
    }

    loadCharacterAbility(characterId: CharacterId) {
        const AbilityClass = AbilityLoader.characterToAbility.get(characterId);
        const ability =
            AbilityClass !== undefined ? new AbilityClass() : undefined;
        return ability;
    }

    loadCharacterTypeAbility(characterId: CharacterId) {
        const character = this.characterLoader.load(characterId);
        const characterType = character.characterType;
        const AbilityClass =
            AbilityLoader.characterTypeToAbility.get(characterType);
        const ability =
            AbilityClass !== undefined ? new AbilityClass() : undefined;
        return ability;
    }
}
