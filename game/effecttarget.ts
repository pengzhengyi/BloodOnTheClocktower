import type { InteractionContext, InteractionInitiator } from './effect';
import { Effects } from './effects';
import { SelfProxy } from './proxy';

export abstract class EffectTarget<TTarget extends object> extends SelfProxy {
    get enabledProxyHandlerPropertyNames():
        | Array<keyof ProxyHandler<TTarget>>
        | undefined {
        return this._enabledProxyHandlerPropertyNames;
    }

    declare effects: Effects<TTarget>;

    protected _enabledProxyHandlerPropertyNames?: Array<
        keyof ProxyHandler<TTarget>
    >;

    protected get _pipeline(): Effects<TTarget> {
        return this.effects;
    }

    protected original?: this;

    constructor(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<TTarget>>
    ) {
        super();
        this.initializeEffects();
        this._enabledProxyHandlerPropertyNames =
            enabledProxyHandlerPropertyNames;
        this.defineDefaultProxyHandlers();
    }

    /**
     * Wrap current object so that specified initiator is in perspective for all further interactions with it.
     *
     * @param initiator The initiator of interaction. Effects might apply / not apply because of it.
     * @returns A no-op proxy forwarding to this object but with interaction initiator set to the specified initiator.
     */
    from(initiator?: InteractionInitiator): this {
        if (initiator === undefined) {
            return this.original === undefined ? this : this.original;
        }

        if (this.original === undefined) {
            this.original = this;
        }

        return EffectTargetFromPerspective.of(
            this,
            initiator
        ) as unknown as this;
    }

    protected createContext(
        proxyHandlerPropertyName: keyof ProxyHandler<TTarget>,
        target: TTarget,
        args: any[]
    ): InteractionContext<TTarget> {
        return {
            interaction: {
                trap: proxyHandlerPropertyName,
                target,
                args,
            },
        };
    }

    protected handleContext(context: InteractionContext<TTarget>): any {
        const updatedContext = this._pipeline.apply(context);
        return updatedContext.result;
    }

    protected initializeEffects() {
        this.effects = Effects.init();
    }

    protected defineDefaultProxyHandlers() {
        if (
            this._enabledProxyHandlerPropertyNames !== undefined &&
            this._enabledProxyHandlerPropertyNames.length > 0
        ) {
            for (const enabledProxyHandlerPropertyName of this
                ._enabledProxyHandlerPropertyNames) {
                this.defineDefaultProxyHandler(enabledProxyHandlerPropertyName);
            }
        }
    }

    protected defineDefaultProxyHandler(
        enabledProxyHandlerPropertyName: keyof ProxyHandler<TTarget>
    ) {
        Object.defineProperty(this, enabledProxyHandlerPropertyName, {
            value: (target: TTarget, ...args: any[]) => {
                const context = this.createContext(
                    enabledProxyHandlerPropertyName,
                    target,
                    args
                );

                return this.handleContext(context);
            },
            writable: false,
        });
    }
}

export class EffectTargetFromPerspective<
    TTarget extends object
> extends EffectTarget<TTarget> {
    static of<TTarget extends object>(
        originalEffectTarget: EffectTarget<TTarget>,
        interactionInitiator: InteractionInitiator
    ) {
        const instance = new this(originalEffectTarget, interactionInitiator);
        return instance.getProxy();
    }

    protected originalEffectTarget: EffectTarget<TTarget>;

    protected interactionInitiator: InteractionInitiator;

    protected originalEffectTargetEnabledProxyHandlerPropertyNames: Set<
        keyof ProxyHandler<TTarget>
    >;

    protected constructor(
        originalEffectTarget: EffectTarget<TTarget>,
        interactionInitiator: InteractionInitiator
    ) {
        super();
        this.originalEffectTarget = originalEffectTarget;
        this.interactionInitiator = interactionInitiator;
        this.originalEffectTargetEnabledProxyHandlerPropertyNames = new Set(
            this.originalEffectTarget.enabledProxyHandlerPropertyNames
        );
    }

    protected createContext(
        proxyHandlerPropertyName: keyof ProxyHandler<TTarget>,
        _target: TTarget,
        args: any[]
    ): InteractionContext<TTarget> {
        const context = super.createContext(
            proxyHandlerPropertyName,
            this.originalEffectTarget as TTarget,
            args
        );
        context.initiator = this.interactionInitiator;
        return context;
    }

    protected handleContext(context: InteractionContext<TTarget>): any {
        if (
            this.originalEffectTargetEnabledProxyHandlerPropertyNames.has(
                context.interaction.trap
            )
        ) {
            return super.handleContext.call(this.originalEffectTarget, context);
        } else {
            // @ts-ignore: forwarding other interaction requests that will not be influenced by effects
            context.result = Reflect[context.interaction.trap].apply(null, [
                context.interaction.target,
                ...context.interaction.args,
            ]);
            return context.result;
        }
    }

    protected initializeEffects() {
        // effects do not need initialization because it will be forwarded
    }

    protected defineDefaultProxyHandlers() {
        this._enabledProxyHandlerPropertyNames = this.proxyHandlerPropertyNames;

        super.defineDefaultProxyHandlers();
    }
}
