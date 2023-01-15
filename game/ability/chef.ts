import {
    ChefInformationRequester,
    InformationRequestContext,
} from '../inforequester';
import type { ChefInformation } from '../information';
import { GetCharacterInformationAbility } from './ability';

export class GetChefInformationAbility extends GetCharacterInformationAbility<
    ChefInformation,
    ChefInformationRequester<InformationRequestContext<ChefInformation>>
> {
    /**
     * {@link `chef["ability"]`}
     */
    static readonly description =
        'You start knowing how many pairs of evil players there are.';

    protected infoRequester = new ChefInformationRequester<
        InformationRequestContext<ChefInformation>
    >();
}
