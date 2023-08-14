import type { IRequest } from '../../../../../../../common/interfaces/request';

export interface ICreateCustomEditionRequest extends IRequest {
    customEditionName: string;

    definition: unknown;
    definitionFormat: string;
}
