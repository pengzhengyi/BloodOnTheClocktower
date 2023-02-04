import type { DemonInformation } from '../provider/demon';
import {
    CharacterTypeInformationRequester,
    IsAlive,
    hasEnoughPlayerForDemonMinionInformation,
    AtFirstNight,
} from './common';
import { type InformationRequestContext } from './requester';
import { Demon } from '~/game/character-type';

class BaseDemonInformationRequester<
    TInformationRequestContext extends InformationRequestContext<DemonInformation>
> extends CharacterTypeInformationRequester<
    DemonInformation,
    TInformationRequestContext
> {
    readonly expectedCharacterType = Demon;
}

export interface DemonInformationRequester<
    TInformationRequestContext extends InformationRequestContext<DemonInformation>
> extends CharacterTypeInformationRequester<
        DemonInformation,
        TInformationRequestContext
    > {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DemonInformationRequester = IsAlive(
    hasEnoughPlayerForDemonMinionInformation(
        AtFirstNight(BaseDemonInformationRequester)
    )
);
