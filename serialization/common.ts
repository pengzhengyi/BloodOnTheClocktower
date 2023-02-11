import type { IJSONSerializable } from './types';

export interface AbstractJSONSerializable<T> extends IJSONSerializable<T> {}

export abstract class AbstractJSONSerializable<T>
    implements IJSONSerializable<T>
{
    async serialize(data: T): Promise<string> {
        const jsonData = await this.encode(data);
        return JSON.stringify(jsonData);
    }

    async deserialize(data: string): Promise<T> {
        const jsonData = JSON.parse(data);
        return await this.decode(jsonData);
    }
}
