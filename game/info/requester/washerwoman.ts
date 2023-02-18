import type { WasherwomanInformation } from '../provider/washerwoman';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

class BaseWasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends CharacterInformationRequester<
    WasherwomanInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.WasherwomanInformation;
    readonly origin = CharacterIds.Washerwoman;
}

export interface WasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends BaseWasherwomanInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const WasherwomanInformationRequester = IsAlive(
    AtFirstNight(BaseWasherwomanInformationRequester)
);
