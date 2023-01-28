import type { MinionInformation } from '../info/provider/minion';
import { MinionInformationRequester } from '../info/requester/minion';
import type { InformationRequestContext } from '../info/requester/requester';
import { GetCharacterTypeInformationAbility } from './ability';

export class GetMinionInformationAbility extends GetCharacterTypeInformationAbility<
    MinionInformation,
    MinionInformationRequester<InformationRequestContext<MinionInformation>>
> {
    /**
     * {@link `glossary["Minion info"]`}
     */
    static readonly description =
        'Shorthand on the night sheet, representing the information that the Minions receive on the first night if there are 7 or more players. The Minions learn which other players are Minions, and which player the Demon is.';

    protected infoRequester = new MinionInformationRequester<
        InformationRequestContext<MinionInformation>
    >();
}
