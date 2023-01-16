import type { DemonInformation } from '../provider/demon';
import {
    CharacterTypeInformationRequester,
    IsAlive,
    hasEnoughPlayerForDemonMinionInformation,
    AtFirstNight,
} from './common';
import { InformationRequestContext } from './requester';
import { Demon } from '~/game/charactertype';

class BaseDemonInformationRequester<
    TInformationRequestContext extends InformationRequestContext<DemonInformation>
> extends CharacterTypeInformationRequester<
    DemonInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Demon;
}

export const DemonInformationRequester = IsAlive(
    hasEnoughPlayerForDemonMinionInformation(
        AtFirstNight(BaseDemonInformationRequester)
    )
);
