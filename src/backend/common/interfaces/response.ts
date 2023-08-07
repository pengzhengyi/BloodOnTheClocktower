import type { WithRequest } from './with-request';
import type { WithStatus } from './with-status';
import type { WithTimestamp } from './with-timestamp';

export interface IResponse<TRequest>
    extends WithTimestamp,
        WithStatus,
        WithRequest<TRequest> {}
