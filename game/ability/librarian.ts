import type { LibrarianInformation } from '../info/provider/librarian';
import { LibrarianInformationRequester } from '../info/requester/librarian';
import type { InformationRequestContext } from '../info/requester/requester';
import { GetCharacterInformationAbility } from './ability';

export class GetLibrarianInformationAbility extends GetCharacterInformationAbility<
    LibrarianInformation,
    LibrarianInformationRequester<
        InformationRequestContext<LibrarianInformation>
    >
> {
    /**
     * {@link `librarian["ability"]`}
     */
    static readonly description =
        'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)';

    protected infoRequester = new LibrarianInformationRequester<
        InformationRequestContext<LibrarianInformation>
    >();
}
