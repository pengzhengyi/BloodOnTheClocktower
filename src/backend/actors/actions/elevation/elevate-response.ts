import type { IResponse } from '../../../common/interfaces/response';
import type { IElevateRequest } from './elevate-request';

/**
 * Response for a user elevation request. Will contain information like whether the elevation is successful or not.
 */
export interface IElevateResponse extends IResponse<IElevateRequest> {}
