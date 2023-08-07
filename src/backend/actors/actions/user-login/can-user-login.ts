import type { IUserLoginRequest } from './user-login-request';
import type { IUserLoginResponse } from './user-login-response';

export interface CanUserLogin {
    userLogin(request: IUserLoginRequest): Promise<IUserLoginResponse>;
}
