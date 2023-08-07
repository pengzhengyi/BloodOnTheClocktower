import type { IResponse } from '../../../common/interfaces/response';
import type { IAdminLoginRequest } from '../admin-login/admin-login-request';

/**
 * Response for a admin logout request. Will contain information like whether the logout is successful or not.
 */
export interface IAdminLogoutResponse extends IResponse<IAdminLoginRequest> {}
