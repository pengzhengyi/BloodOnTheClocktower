import type { TravellerInformation } from '../provider/traveller';
import {
    CharacterTypeInformationRequester,
    AtFirstNight,
    IsEvil,
    IsAlive,
} from './common';
import { InformationRequestContext } from './requester';
import { Traveller } from '~/game/charactertype';

class BaseTravellerInformationRequester<
    TInformationRequestContext extends InformationRequestContext<TravellerInformation>
> extends CharacterTypeInformationRequester<
    TravellerInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Traveller;
}

export const TravellerInformationRequester = AtFirstNight(
    IsEvil(IsAlive(BaseTravellerInformationRequester))
);
