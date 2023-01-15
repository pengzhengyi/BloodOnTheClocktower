import {
    InvestigatorInformationRequester,
    InformationRequestContext,
} from '../inforequester';
import type { InvestigatorInformation } from '../information';
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
