import type {
    FortuneTellerInformationProviderContext,
    FortuneTellerInformation,
} from '../provider/fortuneteller';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, IsAlive, EachNight } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

export interface FortuneTellerInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        FortuneTellerInformationProviderContext {}

class BaseFortuneTellerInformationRequester<
    TInformationRequestContext extends FortuneTellerInformationRequestContext<FortuneTellerInformation>
> extends CharacterInformationRequester<
    FortuneTellerInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.FortuneTellerInformation;
    readonly origin = CharacterIds.FortuneTeller;
}

export interface FortuneTellerInformationRequester<
    TInformationRequestContext extends FortuneTellerInformationRequestContext<FortuneTellerInformation>
> extends BaseFortuneTellerInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FortuneTellerInformationRequester = IsAlive(
    EachNight(BaseFortuneTellerInformationRequester)
);
