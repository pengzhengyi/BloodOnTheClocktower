import {
    EmpathInformationRequester,
    InformationRequestContext,
} from '../inforequester';
import type { EmpathInformation } from '../information';
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
