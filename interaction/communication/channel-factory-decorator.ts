import type { IChannel } from './channel';
import { Channel } from './channel';
import type { IChannelFactory } from './channel-factory';
import { LazyMap } from '~/game/collections';
import { UnsupportedSerializationType } from '~/game/exception/unsupported-serialization-type';
import { JSONSerializable } from '~/serialization/common';

abstract class ChannelFactoryDecorator<K = string, TOptions = RequestInit>
    implements IChannelFactory<K, TOptions>
{
    get socket() {
        return this.channelFactory.socket;
    }

    protected channelFactory: IChannelFactory<K, TOptions>;

    constructor(channelFactory: IChannelFactory<K, TOptions>) {
        this.channelFactory = channelFactory;
    }

    abstract create<TIn, TOut>(
        serializationType: K
    ): IChannel<TIn, TOut, TOptions>;
}

export class Caching<
    K = string,
    TOptions = RequestInit
> extends ChannelFactoryDecorator<K, TOptions> {
    protected cache: LazyMap<K, IChannel<unknown, unknown, TOptions>>;

    constructor(channelFactory: IChannelFactory<K, TOptions>) {
        super(channelFactory);
        this.cache = new LazyMap((key) => this.createNewChannel(key));
    }

    create<TIn, TOut>(serializationType: K): IChannel<TIn, TOut, TOptions> {
        const channel = this.cache.get(serializationType);
        return channel as IChannel<TIn, TOut, TOptions>;
    }

    protected createNewChannel<TIn, TOut>(
        serializationType: K
    ): IChannel<TIn, TOut, TOptions> {
        return this.channelFactory.create<TIn, TOut>(serializationType);
    }
}

export class AddJSONFallback<
    K = string,
    TOptions = RequestInit
> extends ChannelFactoryDecorator<K, TOptions> {
    create<TIn, TOut>(serializationType: K): IChannel<TIn, TOut, TOptions> {
        try {
            return this.channelFactory.create<TIn, TOut>(serializationType);
        } catch (error) {
            if (error instanceof UnsupportedSerializationType) {
                return this.createFallbackChannel();
            }

            throw error;
        }
    }

    protected createFallbackChannel<TIn, TOut>() {
        const channel = new Channel(
            this.socket,
            JSONSerializable,
            JSONSerializable
        );
        return channel as unknown as IChannel<TIn, TOut, TOptions>;
    }
}
