import type { SpyInformation } from '../provider/spy';
import { CharacterInformationRequester, EachNight, IsAlive } from './common';
import { InformationRequestContext } from './requester';
import { Spy } from '~/content/characters/output/spy';

class BaseSpyInformationRequester<
    TInformationRequestContext extends InformationRequestContext<SpyInformation>
> extends CharacterInformationRequester<
    SpyInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Spy;
}

export interface SpyInformationRequester<
    TInformationRequestContext extends InformationRequestContext<SpyInformation>
> extends CharacterInformationRequester<
        SpyInformation,
        TInformationRequestContext
    > {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SpyInformationRequester = EachNight(
    IsAlive(BaseSpyInformationRequester)
);
