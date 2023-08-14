import type { ICreateCustomEditionRequest } from './create-custom-edition-request';
import type { ICreateCustomEditionResponse } from './create-custom-edition-response';

export interface CanCreateCustomEdition {
    createCustomEdition(
        request: ICreateCustomEditionRequest
    ): Promise<ICreateCustomEditionResponse>;
}
