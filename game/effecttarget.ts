import type { InteractionContext } from './effect';
import type { Effects } from './effects';
import { SelfProxy } from './proxy';

export abstract class EffectTarget<TTarget extends object> extends SelfProxy {
    declare abstract readonly _effects: Effects<TTarget>;

    protected get _pipeline(): Effects<TTarget> {
        return this._effects;
    }

    constructor(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<TTarget>>
    ) {
        super();

        this.defineDefaultProxyHandlers(enabledProxyHandlerPropertyNames);
    }

    protected defineDefaultProxyHandlers(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<TTarget>>
    ) {
        if (
            enabledProxyHandlerPropertyNames !== undefined &&
            enabledProxyHandlerPropertyNames.length > 0
        ) {
            for (const enabledProxyHandlerPropertyName of enabledProxyHandlerPropertyNames) {
                this.defineDefaultProxyHandler(enabledProxyHandlerPropertyName);
            }
        }
    }

    protected defineDefaultProxyHandler(
        enabledProxyHandlerPropertyName: string
    ) {
        Object.defineProperty(
            this,
            enabledProxyHandlerPropertyName,
            (target: TTarget, ...args: any[]) => {
                const context = this.createContext(
                    enabledProxyHandlerPropertyName,
                    target,
                    args
                );

                return this.handleContext(context);
            }
        );
    }

    protected createContext(
        proxyHandlerPropertyName: string,
        target: TTarget,
        ...args: any[]
    ): InteractionContext<TTarget> {
        return {
            request: {
                trap: proxyHandlerPropertyName,
                target,
                args,
            },
            // TODO requester: this.tasks.top(),
        };
    }

    protected handleContext(context: InteractionContext<TTarget>): any {
        const updatedContext = this._pipeline.apply(context);
        return updatedContext.response;
    }
}
