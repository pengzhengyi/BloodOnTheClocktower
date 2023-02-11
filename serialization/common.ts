import type { IJSONSerializable, ISerializable } from './types';
import type { TJSON } from '~/game/types';

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

export const JSONSerializable: ISerializable<TJSON> = class JSONSerializable {
    static serialize(data: TJSON): Promise<string> {
        return Promise.resolve(JSON.stringify(data));
    }

    static deserialize(data: string): Promise<TJSON> {
        return Promise.resolve(JSON.parse(data));
    }
};
