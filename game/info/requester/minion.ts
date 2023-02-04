import type { MinionInformation } from '../provider/minion';
import {
    CharacterTypeInformationRequester,
    IsAlive,
    hasEnoughPlayerForDemonMinionInformation,
    AtFirstNight,
} from './common';
import { type InformationRequestContext } from './requester';
import { Minion } from '~/game/character/character-type';

class BaseMinionInformationRequester<
    TInformationRequestContext extends InformationRequestContext<MinionInformation>
> extends CharacterTypeInformationRequester<
    MinionInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Minion;
}

export interface MinionInformationRequester<
    TInformationRequestContext extends InformationRequestContext<MinionInformation>
> extends CharacterTypeInformationRequester<
        MinionInformation,
        TInformationRequestContext
    > {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MinionInformationRequester = IsAlive(
    hasEnoughPlayerForDemonMinionInformation(
        AtFirstNight(BaseMinionInformationRequester)
    )
);
