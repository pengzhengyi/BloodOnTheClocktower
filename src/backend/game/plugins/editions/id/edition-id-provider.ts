import type { ICustomEditionIdProvider } from './custom-edition-id-provider';
import type { IOfficialEditionIdProvider } from './official-edition-id-provider';

export interface IEditionIdProvider
    extends IOfficialEditionIdProvider,
        ICustomEditionIdProvider {}
