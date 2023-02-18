import type { SpyInformation } from '../provider/spy';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, EachNight, IsAlive } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

class BaseSpyInformationRequester<
    TInformationRequestContext extends InformationRequestContext<SpyInformation>
> extends CharacterInformationRequester<
    SpyInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.SpyInformation;
    readonly origin = CharacterIds.Spy;
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
