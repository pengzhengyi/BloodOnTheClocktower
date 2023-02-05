import type { OneOfTwoPlayersIsTownsfolk } from '../information';
import { InfoType } from '../info-type';
import { OneOfTwoPlayersHasCharacterTypeInformationProvider } from './common';
import type { InfoProvideContext } from './provider';
import { type CharacterType, Townsfolk } from '~/game/character/character-type';

export type WasherwomanInformation = OneOfTwoPlayersIsTownsfolk;

export class WasherwomanInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    WasherwomanInformation
> {
    readonly infoType = InfoType.WasherwomanInformation;

    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}
