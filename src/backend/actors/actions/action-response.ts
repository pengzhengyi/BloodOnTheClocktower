import type { IResponse } from '../../common/interfaces/response';
import type { IActionRequest } from './action-request';

export interface IActionResponse extends IResponse<IActionRequest> {}
