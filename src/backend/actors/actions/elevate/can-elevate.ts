import type { IElevateRequest } from './elevate-request';
import type { IElevateResponse } from './elevate-response';

export interface CanElevate {
    elevate(request: IElevateRequest): Promise<IElevateResponse>;
}
