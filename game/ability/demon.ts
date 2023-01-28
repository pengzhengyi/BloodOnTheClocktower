import { DemonInformation } from '../info/provider/demon';
import { DemonInformationRequester } from '../info/requester/demon';
import { InformationRequestContext } from '../info/requester/requester';
import { GetCharacterTypeInformationAbility } from './ability';

export class GetDemonInformationAbility extends GetCharacterTypeInformationAbility<
    DemonInformation,
    DemonInformationRequester<InformationRequestContext<DemonInformation>>
> {
    /**
     * {@link `glossary["Demon info"]`}
     */
    static readonly description =
        'Shorthand on the night sheet, representing the information that the Demons receive on the first night if there are 7 or more players. The Demons learn which other players are Demons, and which player the Demon is.';

    protected infoRequester = new DemonInformationRequester<
        InformationRequestContext<DemonInformation>
    >();
}
