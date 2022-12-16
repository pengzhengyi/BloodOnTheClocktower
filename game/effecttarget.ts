import { Effects } from './effects';
import { ProxyPipeline } from './proxymiddleware';

export abstract class EffectTarget<
    TTarget extends object
> extends ProxyPipeline<TTarget, Effects<TTarget>> {
    declare abstract readonly _effects: Effects<TTarget>;

    protected get _pipeline(): Effects<TTarget> {
        return this._effects;
    }
}
