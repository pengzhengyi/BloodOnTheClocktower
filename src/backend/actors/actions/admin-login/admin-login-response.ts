import type { IResponse } from '../../../common/interfaces/response';
import type { IAdminLoginRequest } from './admin-login-request';

/**
 * Response for a admin login request. Will contain information like whether the login is successful or not.
 */
export interface IAdminLoginResponse extends IResponse<IAdminLoginRequest> {}
