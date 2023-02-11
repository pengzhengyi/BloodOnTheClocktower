import type { IChannel } from './channel';
import { Channel } from './channel';
import type { ISocket } from './socket';
import type { ISerializationFactory } from '~/serialization/types';

export interface IChannelFactory<
    K = string,
    TOptions extends RequestInit = RequestInit
> {
    create<TIn, TOut>(serializationType: K): IChannel<TIn, TOut, TOptions>;
}

export class ChannelFactory<
    K = string,
    TOptions extends RequestInit = RequestInit
> {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        readonly serializationFactory: ISerializationFactory<K>,
        readonly socket: ISocket<TOptions>
    ) {}

    create<TIn, TOut>(serializationType: K): IChannel<TIn, TOut, TOptions> {
        const serializer =
            this.serializationFactory.getSerializer<TIn>(serializationType);
        const deserializer =
            this.serializationFactory.getDeserializer<TOut>(serializationType);

        return new Channel(this.socket, serializer, deserializer);
    }
}
