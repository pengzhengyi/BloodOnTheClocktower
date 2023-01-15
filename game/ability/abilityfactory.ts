/* eslint-disable no-dupe-class-members */
import type { CharacterToken } from '../character';
import { Generator } from '../collections';
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

const CHARACTERS = [
    Washerwoman,
    Librarian,
    Investigator,
    Chef,
    Empath,
    FortuneTeller,
    Undertaker,
    Monk,
    Ravenkeeper,
    Virgin,
    Slayer,
    Soldier,
    Mayor,
    Butler,
    Recluse,
    Saint,
] as const;
type TCharacterToken = typeof CHARACTERS[number];

const ABILITIES = [
    GetWasherwomanInformationAbility,
    GetLibrarianInformationAbility,
    GetInvestigatorInformationAbility,
    GetChefInformationAbility,
    GetEmpathInformationAbility,
    GetFortuneTellerInformationAbility,
    GetUndertakerInformationAbility,
    MonkProtectAbility,
    GetRavenkeeperInformationAbility,
    VirginAbility,
    SlayerAbility,
    SoldierAbility,
    MayorAbility,
    ButlerAbility,
    RecluseAbility,
    SaintAbility,
] as const;

type TCharacterAbility = typeof ABILITIES[number];

export class AbilityLoader {
    static characterToAbility: Map<TCharacterToken, TCharacterAbility> =
        new Map(Generator.pair(CHARACTERS, ABILITIES));

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
    load(character: typeof Recluse): [typeof RecluseAbility];
    load(character: typeof Saint): [typeof SaintAbility];

    load(character: CharacterToken): Array<TCharacterAbility> {
        const abilities = [];

        const characterAbility = this.loadCharacterAbility(character);
        if (characterAbility !== undefined) {
            abilities.push(characterAbility);
        }

        return abilities;
    }

    protected loadCharacterAbility(
        character: CharacterToken
    ): TCharacterAbility | undefined {
        return AbilityLoader.characterToAbility.get(character);
    }
}
