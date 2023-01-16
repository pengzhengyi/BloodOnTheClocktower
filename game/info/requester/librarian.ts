import type { LibrarianInformation } from '../provider/librarian';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { InformationRequestContext } from './requester';
import { Librarian } from '~/content/characters/output/librarian';

class BaseLibrarianInformationRequester<
    TInformationRequestContext extends InformationRequestContext<LibrarianInformation>
> extends CharacterInformationRequester<
    LibrarianInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Librarian;
}

export interface LibrarianInformationRequester<
    TInformationRequestContext extends InformationRequestContext<LibrarianInformation>
> extends BaseLibrarianInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LibrarianInformationRequester = IsAlive(
    AtFirstNight(BaseLibrarianInformationRequester)
);
