import type { IAdminLogoutRequest } from './admin-logout-request';
import type { IAdminLogoutResponse } from './admin-logout-response';

export interface CanAdminLogout {
    adminLogout(request: IAdminLogoutRequest): Promise<IAdminLogoutResponse>;
}
