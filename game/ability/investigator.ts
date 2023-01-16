import type { InvestigatorInformation } from '../info/provider/investigator';
import { InvestigatorInformationRequester } from '../info/requester/investigator';
import type { InformationRequestContext } from '../info/requester/requester';
import { GetCharacterInformationAbility } from './ability';

export class GetInvestigatorInformationAbility extends GetCharacterInformationAbility<
    InvestigatorInformation,
    InvestigatorInformationRequester<
        InformationRequestContext<InvestigatorInformation>
    >
> {
    /**
     * {@link `investigator["ability"]`}
     */
    static readonly description =
        'You start knowing that 1 of 2 players is a particular Minion.';

    protected infoRequester = new InvestigatorInformationRequester<
        InformationRequestContext<InvestigatorInformation>
    >();
}
