import type { EmpathInformation } from '../provider/empath';
import { CharacterInformationRequester, IsAlive, EachNight } from './common';
import { type InformationRequestContext } from './requester';
import { Empath } from '~/content/characters/output/empath';

class BaseEmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends CharacterInformationRequester<
    EmpathInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Empath;
}

export interface EmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends BaseEmpathInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EmpathInformationRequester = IsAlive(
    EachNight(BaseEmpathInformationRequester)
);
