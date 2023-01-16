import type { OneOfTwoPlayersIsTownsfolk } from '../information';
import { OneOfTwoPlayersHasCharacterTypeInformationProvider } from './common';
import type { InfoProvideContext } from './provider';
import { CharacterType, Townsfolk } from '~/game/charactertype';

export type WasherwomanInformation = OneOfTwoPlayersIsTownsfolk;

export class WasherwomanInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    WasherwomanInformation
> {
    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}
