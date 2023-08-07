import type { IResponse } from '../../../common/interfaces/response';
import type { IUserLoginRequest } from './user-login-request';

/**
 * Response for a user login request. Will contain information like whether the login is successful or not.
 */
export interface IUserLoginResponse extends IResponse<IUserLoginRequest> {}
