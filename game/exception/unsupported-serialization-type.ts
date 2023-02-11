import { RecoverableGameError } from './exception';
import type { ISerializationFactory } from '~/serialization/types';

export class UnsupportedSerializationType<T> extends RecoverableGameError {
    static description = 'Specified serialization type is not supported';

    constructor(
        readonly type: T,
        readonly serializationFactory: ISerializationFactory,
        readonly supportedTypes?: Iterable<unknown>
    ) {
        super(UnsupportedSerializationType.description);
    }
}
