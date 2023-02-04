import type { OneOfTwoPlayersIsTownsfolk } from '../information';
import { OneOfTwoPlayersHasCharacterTypeInformationProvider } from './common';
import type { InfoProvideContext } from './provider';
import { type CharacterType, Townsfolk } from '~/game/character-type';

export type WasherwomanInformation = OneOfTwoPlayersIsTownsfolk;

export class WasherwomanInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    WasherwomanInformation
> {
    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}
