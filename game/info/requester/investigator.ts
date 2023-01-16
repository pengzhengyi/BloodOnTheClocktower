import type { InvestigatorInformation } from '../provider/investigator';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { InformationRequestContext } from './requester';
import { Investigator } from '~/content/characters/output/investigator';

class BaseInvestigatorInformationRequester<
    TInformationRequestContext extends InformationRequestContext<InvestigatorInformation>
> extends CharacterInformationRequester<
    InvestigatorInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Investigator;
}

export interface InvestigatorInformationRequester<
    TInformationRequestContext extends InformationRequestContext<InvestigatorInformation>
> extends BaseInvestigatorInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const InvestigatorInformationRequester = IsAlive(
    AtFirstNight(BaseInvestigatorInformationRequester)
);
