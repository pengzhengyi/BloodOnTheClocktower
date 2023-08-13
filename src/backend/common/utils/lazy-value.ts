import type { Factory } from '../types/factory';

export class LazyValue<T> {
    get value(): T {
        if (!this.isActualValueCreated) {
            this.actualValue = this.valueFactory();
            this.isActualValueCreated = true;
        }

        return this.actualValue as T;
    }

    get isValueCreated(): boolean {
        return this.isActualValueCreated;
    }

    protected readonly valueFactory: Factory<T>;

    protected actualValue: T | undefined;

    protected isActualValueCreated = false;

    constructor(valueFactory: Factory<T>) {
        this.valueFactory = valueFactory;
    }
}
