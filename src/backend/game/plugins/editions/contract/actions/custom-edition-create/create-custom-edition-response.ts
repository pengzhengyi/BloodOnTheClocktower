import type { IResponse } from '../../../../../../common/interfaces/response';
import type { IEdition } from '../../../edition';
import type { ICreateCustomEditionRequest } from './create-custom-edition-request';

export interface ICreateCustomEditionResponse
    extends IResponse<ICreateCustomEditionRequest> {
    edition?: IEdition;
}
