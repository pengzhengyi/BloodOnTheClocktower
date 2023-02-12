import type { IChannel } from './channel';
import { Channel } from './channel';
import type { ISocket } from './socket';
import type {
    ISerializationFactory,
    ISerializationOptions,
} from '~/serialization/types';

export interface IChannelFactory<K = string, TOptions = RequestInit> {
    readonly socket: ISocket<TOptions>;

    /**
     * Create a channel that can transmit data of `TIn` and receive response of `TOut` type.
     */
    create<TIn, TOut>(
        options: ISerializationOptions<K>
    ): IChannel<TIn, TOut, TOptions>;
}

export class ChannelFactory<K = string, TOptions = RequestInit>
    implements IChannelFactory<K, TOptions>
{
    // eslint-disable-next-line no-useless-constructor
    constructor(
        readonly serializationFactory: ISerializationFactory<K>,
        readonly socket: ISocket<TOptions>
    ) {}

    create<TIn, TOut>(
        options: ISerializationOptions<K>
    ): IChannel<TIn, TOut, TOptions> {
        const serializer = this.serializationFactory.getSerializer<TIn>(
            options.serializationType
        );
        const deserializer = this.serializationFactory.getDeserializer<TOut>(
            options.deserializationType
        );

        return new Channel(this.socket, serializer, deserializer);
    }
}
