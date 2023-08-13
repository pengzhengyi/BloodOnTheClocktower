import type { ICustomCharacterIdProvider } from './custom-character-id-provider';
import type { IOfficialCharacterIdProvider } from './official-character-id-provider';

export interface ICharacterIdProvider
    extends IOfficialCharacterIdProvider,
        ICustomCharacterIdProvider {}
