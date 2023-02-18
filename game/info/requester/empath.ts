import type { EmpathInformation } from '../provider/empath';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, IsAlive, EachNight } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

class BaseEmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends CharacterInformationRequester<
    EmpathInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.EmpathInformation;
    readonly origin = CharacterIds.Empath;
}

export interface EmpathInformationRequester<
    TInformationRequestContext extends InformationRequestContext<EmpathInformation>
> extends BaseEmpathInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EmpathInformationRequester = IsAlive(
    EachNight(BaseEmpathInformationRequester)
);
