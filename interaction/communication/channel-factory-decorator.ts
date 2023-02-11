import type { IChannel } from './channel';
import type { IChannelFactory } from './channel-factory';
import { LazyMap } from '~/game/collections';

abstract class ChannelFactoryDecorator<
    K = string,
    TOptions extends RequestInit = RequestInit
> implements IChannelFactory<K, TOptions>
{
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
    TOptions extends RequestInit = RequestInit
> extends ChannelFactoryDecorator<K, TOptions> {
    protected cache: LazyMap<K, IChannel<unknown, unknown, TOptions>>;

    constructor(channelFactory: IChannelFactory<K, TOptions>) {
        super(channelFactory);
        this.cache = new LazyMap((key) => this.createNew(key));
    }

    create<TIn, TOut>(serializationType: K): IChannel<TIn, TOut, TOptions> {
        const channel = this.cache.get(serializationType);
        return channel as IChannel<TIn, TOut, TOptions>;
    }

    protected createNew<TIn, TOut>(
        serializationType: K
    ): IChannel<TIn, TOut, TOptions> {
        return this.channelFactory.create<TIn, TOut>(serializationType);
    }
}
