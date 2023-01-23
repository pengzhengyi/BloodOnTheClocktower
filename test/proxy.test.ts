import { SelfProxy } from '~/game/proxy/proxy';

class TestProxy extends SelfProxy {
    readonly foo = 10;

    static init() {
        const instance = new this();
        return instance.getProxy();
    }

    get(target: this, property: string | symbol, receiver: any): any {
        const original = Reflect.get(target, property, receiver);

        switch (property) {
            case 'bar':
                return Reflect.get(target, 'foo', receiver);
            default:
                return original;
        }
    }
}

test.concurrent('test basic proxy', () => {
    const unproxied = new TestProxy();
    expect(unproxied.foo).toEqual(10);
    expect((unproxied as any).bar).toBeUndefined();

    const proxied = TestProxy.init();
    expect(proxied.foo).toEqual(10);
    expect((proxied as any).bar).toEqual(10);
});
