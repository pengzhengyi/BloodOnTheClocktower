import type { ISocket } from './socket';
import type { IDeserializer, ISerializer } from '~/serialization/types';

export interface IChannel<TIn, TOut, TOptions = RequestInit> {
    send(url: string, data: TIn, options?: TOptions): void;

    communicate(url: string, data: TIn, options?: TOptions): Promise<TOut>;
}

export class Channel<TIn, TOut, TOptions = RequestInit>
    implements IChannel<TIn, TOut, TOptions>
{
    // eslint-disable-next-line no-useless-constructor
    constructor(
        protected readonly socket: ISocket<TOptions>,
        protected readonly serializer: ISerializer<TIn>,
        protected readonly deserializer?: IDeserializer<TOut>
    ) {}

    send(url: string, data: TIn, options?: TOptions) {
        const serialized = this.serialize(data);
        serialized.then((serialized) =>
            this.socket.send(url, serialized, options)
        );
    }

    async communicate(
        url: string,
        data: TIn,
        options: TOptions
    ): Promise<TOut> {
        const serialized = await this.serialize(data);
        const response = await this.socket.communicate(
            url,
            serialized,
            options
        );
        const deserialized = await this.deserialize(response);
        return deserialized;
    }

    protected serialize(data: TIn): Promise<string> {
        return this.serializer.serialize(data);
    }

    protected async deserialize(data: string): Promise<TOut> {
        if (this.deserializer === undefined) {
            throw new Error('No deserializer provided');
        }

        const deserialized = await this.deserializer.deserialize(data);
        return deserialized;
    }
}
