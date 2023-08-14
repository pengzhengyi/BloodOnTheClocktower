import type { IResponse } from '../../../../../../common/interfaces/response';
import type { EditionId } from '../../../id/edition-id';
import type { IListOfficialEditionRequest } from './list-official-edition-request';

export interface IListOfficialEditionResponse
    extends IResponse<IListOfficialEditionRequest> {
    editionIds: Set<EditionId>;
}
