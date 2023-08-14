import type { IResponse } from '../../../../../../../common/interfaces/response';
import type { IEdition } from '../../../edition';
import type { ILoadEditionRequest } from './load-edition-request';

export interface ILoadEditionResponse extends IResponse<ILoadEditionRequest> {
    edition?: IEdition;
}
