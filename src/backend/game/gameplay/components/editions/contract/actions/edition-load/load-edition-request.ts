import type { IRequest } from '../../../../../../../common/interfaces/request';
import type { EditionId } from '../../../id/edition-id';

export interface ILoadEditionRequest extends IRequest {
    editionId: EditionId;
}
