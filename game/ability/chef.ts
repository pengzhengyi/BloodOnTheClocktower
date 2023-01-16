import type { ChefInformation } from '../info/provider/chef';
import { ChefInformationRequester } from '../info/requester/chef';
import type { InformationRequestContext } from '../info/requester/requester';
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
