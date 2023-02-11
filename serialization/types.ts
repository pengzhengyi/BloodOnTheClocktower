import type { TJSON } from '~/game/types';

export interface IJSONEncoder<T> {
    encode(data: T): Promise<TJSON>;
}

export interface IJSONDecoder<T> {
    decode(jsonData: TJSON): Promise<T>;
}

export interface IJSONable<T> extends IJSONEncoder<T>, IJSONDecoder<T> {}

export interface ISerializer<T> {
    serialize(data: T): Promise<string>;
}

export interface IDeserializer<T> {
    deserialize(data: string): Promise<T>;
}

export interface ISerializable<T> extends ISerializer<T>, IDeserializer<T> {}

export interface IJSONSerializable<T> extends IJSONable<T>, ISerializable<T> {}

export interface ISerializationFactory<K = string> {
    getEncoder<T>(key: K): IJSONEncoder<T>;
    getDecoder<T>(key: K): IJSONDecoder<T>;
    getSerializer<T>(key: K): ISerializer<T>;
    getDeserializer<T>(key: K): IDeserializer<T>;
}
