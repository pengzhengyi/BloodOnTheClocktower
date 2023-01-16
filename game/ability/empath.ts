import type { EmpathInformation } from '../info/provider/empath';
import { EmpathInformationRequester } from '../info/requester/empath';
import type { InformationRequestContext } from '../info/requester/requester';
import { GetCharacterInformationAbility } from './ability';

export class GetEmpathInformationAbility extends GetCharacterInformationAbility<
    EmpathInformation,
    EmpathInformationRequester<InformationRequestContext<EmpathInformation>>
> {
    /**
     * {@link `empath["ability"]`}
     */
    static readonly description =
        'Each night, you learn how many of your 2 alive neighbours are evil.';

    protected infoRequester = new EmpathInformationRequester<
        InformationRequestContext<EmpathInformation>
    >();
}
