import { Middleware } from './middleware';

export interface ProxyHandlerRequest<TTarget extends object> {
    trap: string;
    target: TTarget;
    args: any[];
}

export interface ProxyMiddlewareContext<TTarget extends object> {
    request: ProxyHandlerRequest<TTarget>;
    target: TTarget;
}

export interface ProxyMiddleware<TTarget extends object>
    extends Middleware<ProxyMiddlewareContext<TTarget>> {
    isApplicable(request: ProxyHandlerRequest<TTarget>): boolean;
}

// export abstract class ProxyPipeline<TTarget extends object, TPipeline extends Pipeline<ProxyMiddlewareContext<TTarget>, ProxyMiddleware<TTarget>>> extends SelfProxy {
//     protected abstract _pipeline: TPipeline;

//     constructor(enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<TTarget>>) {
//         super();

//         this.defineDefaultProxyHandlers(enabledProxyHandlerPropertyNames);
//     }

//     protected defineDefaultProxyHandlers(enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<TTarget>>) {
//         if (enabledProxyHandlerPropertyNames !== undefined && enabledProxyHandlerPropertyNames.length > 0) {
//             for (const enabledProxyHandlerPropertyName of enabledProxyHandlerPropertyNames) {
//                 this.defineDefaultProxyHandler(enabledProxyHandlerPropertyName);
//             }
//         }
//     }

//     protected defineDefaultProxyHandler(enabledProxyHandlerPropertyName: string) {
//         Object.defineProperty(this, enabledProxyHandlerPropertyName, (target: TTarget, ...args: any[]) => {
//             const context = this.createProxyMiddlewareContext(enabledProxyHandlerPropertyName, target, args);

//             return this.processContextByPipeline(context);
//         });
//     }

//     protected createProxyMiddlewareContext(proxyHandlerPropertyName: string, target: TTarget, ...args: any[]): ProxyMiddlewareContext<TTarget> {
//         return {
//             request: {
//                 trap: proxyHandlerPropertyName,
//                 target,
//                 args
//             },
//             target,
//         }
//     }

//     protected getApplicableMiddlewares(context: ProxyMiddlewareContext<TTarget>): Array<ProxyMiddleware<TTarget>> {

//     }

//     protected processContextByPipeline(context: ProxyMiddlewareContext<TTarget>): any {

//     }
// }
