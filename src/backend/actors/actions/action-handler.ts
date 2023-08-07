import type { IActionRequest } from './action-request';
import type { IActionResponse } from './action-response';

/**
 * Interface for action handler.
 */
export interface IActionHandler {
    handle(request: IActionRequest): Promise<IActionResponse>;
}
