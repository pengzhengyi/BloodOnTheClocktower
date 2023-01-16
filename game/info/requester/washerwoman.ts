import type { WasherwomanInformation } from '../provider/washerwoman';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { InformationRequestContext } from './requester';
import { Washerwoman } from '~/content/characters/output/washerwoman';

class BaseWasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends CharacterInformationRequester<
    WasherwomanInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Washerwoman;
}

export interface WasherwomanInformationRequester<
    TInformationRequestContext extends InformationRequestContext<WasherwomanInformation>
> extends BaseWasherwomanInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const WasherwomanInformationRequester = IsAlive(
    AtFirstNight(BaseWasherwomanInformationRequester)
);
