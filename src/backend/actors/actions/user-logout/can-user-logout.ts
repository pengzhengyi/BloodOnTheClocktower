import type { IUserLogoutRequest } from './user-logout-request';
import type { IUserLogoutResponse } from './user-logout-response';

export interface CanUserLogout {
    userLogout(request: IUserLogoutRequest): Promise<IUserLogoutResponse>;
}
