import type { OneOfTwoPlayersIsMinion } from '../information';
import { InfoType } from '../info-type';
import { OneOfTwoPlayersHasCharacterTypeInformationProvider } from './common';
import type { InfoProvideContext } from './provider';
import { type CharacterType, Minion } from '~/game/character/character-type';

export type InvestigatorInformation = OneOfTwoPlayersIsMinion;

export class InvestigatorInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    InvestigatorInformation
> {
    protected expectedCharacterType: typeof CharacterType = Minion;

    readonly infoType = InfoType.InvestigatorInformation;
}
