import type { IAdminLoginRequest } from './admin-login-request';
import type { IAdminLoginResponse } from './admin-login-response';

export interface CanAdminLogin {
    adminLogin(request: IAdminLoginRequest): Promise<IAdminLoginResponse>;
}
