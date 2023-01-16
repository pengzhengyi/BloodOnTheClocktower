import type { WasherwomanInformation } from '../info/provider/washerwoman';
import type { InformationRequestContext } from '../info/requester/requester';
import { WasherwomanInformationRequester } from '../info/requester/washerwoman';
import { GetCharacterInformationAbility } from './ability';

export class GetWasherwomanInformationAbility extends GetCharacterInformationAbility<
    WasherwomanInformation,
    WasherwomanInformationRequester<
        InformationRequestContext<WasherwomanInformation>
    >
> {
    /**
     * {@link `washerwoman["ability"]`}
     */
    static readonly description =
        'You start knowing that 1 of 2 players is a particular Townsfolk.';

    protected infoRequester = new WasherwomanInformationRequester<
        InformationRequestContext<WasherwomanInformation>
    >();
}
