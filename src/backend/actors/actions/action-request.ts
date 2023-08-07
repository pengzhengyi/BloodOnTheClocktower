import type { IRequest } from '../../common/interfaces/request';
import type { IActionType } from './action-type';

/**
 * Request for an actor to perform an action. By specifying the action type, the actor can delegate the action to the appropriate role to handle this action request.
 */
export interface IActionRequest extends IRequest {
    readonly actionType: IActionType;
}
