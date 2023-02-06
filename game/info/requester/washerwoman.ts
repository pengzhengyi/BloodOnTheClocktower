import type { WasherwomanInformation } from '../provider/washerwoman';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { type InformationRequestContext } from './requester';
import { Washerwoman } from '~/content/characters/output/washerwoman';

class BaseWasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends CharacterInformationRequester<
    WasherwomanInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.WasherwomanInformation;
    readonly expectedCharacter = Washerwoman;
}

export interface WasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends BaseWasherwomanInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const WasherwomanInformationRequester = IsAlive(
    AtFirstNight(BaseWasherwomanInformationRequester)
);