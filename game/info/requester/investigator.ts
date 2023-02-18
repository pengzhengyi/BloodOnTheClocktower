import type { InvestigatorInformation } from '../provider/investigator';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

class BaseInvestigatorInformationRequester<
    TInformationRequestContext extends InformationRequestContext<InvestigatorInformation>
> extends CharacterInformationRequester<
    InvestigatorInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.InvestigatorInformation;
    readonly origin = CharacterIds.Investigator;
}

export interface InvestigatorInformationRequester<
    TInformationRequestContext extends InformationRequestContext<InvestigatorInformation>
> extends BaseInvestigatorInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const InvestigatorInformationRequester = IsAlive(
    AtFirstNight(BaseInvestigatorInformationRequester)
);
