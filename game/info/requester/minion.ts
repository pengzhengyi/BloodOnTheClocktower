import type { MinionInformation } from '../provider/minion';
import {
    CharacterTypeInformationRequester,
    IsAlive,
    hasEnoughPlayerForDemonMinionInformation,
    AtFirstNight,
} from './common';
import { InformationRequestContext } from './requester';
import { Minion } from '~/game/charactertype';

class BaseMinionInformationRequester<
    TInformationRequestContext extends InformationRequestContext<MinionInformation>
> extends CharacterTypeInformationRequester<
    MinionInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Minion;
}

export const MinionInformationRequester = IsAlive(
    hasEnoughPlayerForDemonMinionInformation(
        AtFirstNight(BaseMinionInformationRequester)
    )
);
