import type { LibrarianInformation } from '../provider/librarian';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, IsAlive, AtFirstNight } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

class BaseLibrarianInformationRequester<
    TInformationRequestContext extends InformationRequestContext<LibrarianInformation>
> extends CharacterInformationRequester<
    LibrarianInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.LibrarianInformation;
    readonly origin = CharacterIds.Librarian;
}

export interface LibrarianInformationRequester<
    TInformationRequestContext extends InformationRequestContext<LibrarianInformation>
> extends BaseLibrarianInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LibrarianInformationRequester = IsAlive(
    AtFirstNight(BaseLibrarianInformationRequester)
);
