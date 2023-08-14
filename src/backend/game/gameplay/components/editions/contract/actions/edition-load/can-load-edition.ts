import type { ILoadEditionRequest } from './load-edition-request';
import type { ILoadEditionResponse } from './load-edition-response';

export interface CanLoadEdition {
    loadEdition(request: ILoadEditionRequest): Promise<ILoadEditionResponse>;
}
