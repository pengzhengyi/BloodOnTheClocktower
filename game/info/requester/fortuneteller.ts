import type {
    FortuneTellerInformationProviderContext,
    FortuneTellerInformation,
} from '../provider/fortuneteller';
import { CharacterInformationRequester, IsAlive, EachNight } from './common';
import { type InformationRequestContext } from './requester';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';

export interface FortuneTellerInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        FortuneTellerInformationProviderContext {}

class BaseFortuneTellerInformationRequester<
    TInformationRequestContext extends FortuneTellerInformationRequestContext<FortuneTellerInformation>
> extends CharacterInformationRequester<
    FortuneTellerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = FortuneTeller;
}

export interface FortuneTellerInformationRequester<
    TInformationRequestContext extends FortuneTellerInformationRequestContext<FortuneTellerInformation>
> extends BaseFortuneTellerInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FortuneTellerInformationRequester = IsAlive(
    EachNight(BaseFortuneTellerInformationRequester)
);
