import type { IResponse } from '../../../common/interfaces/response';
import type { IUserLogoutRequest } from './user-logout-request';

/**
 * Response for a user logout request. Will contain information like whether the logout is successful or not.
 */
export interface IUserLogoutResponse extends IResponse<IUserLogoutRequest> {}
