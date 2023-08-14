import type { IListOfficialEditionRequest } from './list-official-edition-request';
import type { IListOfficialEditionResponse } from './list-official-edition-response';

export interface CanListOfficialEdition {
    listOfficialEdition(
        request: IListOfficialEditionRequest
    ): Promise<IListOfficialEditionResponse>;
}
