import type { Schema } from 'yup';
import { AbstractJSONSerializable } from './common';
import type { TJSON } from '~/game/types';

export abstract class DirectSchemaAdapter<
    T,
    TSchema extends Schema<T> = Schema<T>
> extends AbstractJSONSerializable<T> {
    abstract schema: TSchema;

    decode(jsonData: TJSON): Promise<T> {
        return this.schema.validate(jsonData);
    }
}

export abstract class IndirectSchemaAdapter<
    T,
    I,
    TSchema extends Schema<I>
> extends AbstractJSONSerializable<T> {
    abstract readonly schema: TSchema;

    async decode(jsonData: TJSON): Promise<T> {
        const intermediateValue = await this.schema.validate(jsonData);
        return this.revive(intermediateValue);
    }

    abstract revive(intermediateValue: I): Promise<T>;
}
