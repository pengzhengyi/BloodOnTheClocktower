import type { Info } from '../info';
import type { Information } from '../information';
import type { InfoProvideContext } from '../provider/provider';
import type { StoryTellerInformation } from '../storyteller-information';

export interface InfoRequestContext<TInformation> extends InfoProvideContext {
    // eslint-disable-next-line no-use-before-define
    requester: IInfoRequester<TInformation, this>;

    isStoryTellerInformation: boolean;
}

export interface InformationRequestContext<TInformation>
    extends InfoRequestContext<TInformation> {
    willGetTrueInformation: boolean;
}

export interface IInfoRequester<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>
> {
    isEligible(context: InfoProvideContext): Promise<boolean>;

    request(context: TInfoRequestContext): Promise<Info<TInformation>>;

    createContext(...args: any[]): Promise<TInfoRequestContext>;
}

export class InfoRequester<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>
> implements IInfoRequester<TInformation, TInfoRequestContext>
{
    request(context: TInfoRequestContext): Promise<Info<TInformation>> {
        return this._request(context);
    }

    isEligible(_context: InfoProvideContext): Promise<boolean> {
        return Promise.resolve(true);
    }

    createContext(..._args: any[]): Promise<TInfoRequestContext> {
        throw new Error('Method not implemented.');
    }

    _request(context: TInfoRequestContext): Promise<Info<TInformation>> {
        return context.storyteller.giveInfo(context);
    }
}

export interface IInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends IInfoRequester<TInformation, TInformationRequestContext> {
    willGetTrueInformation(context: InfoProvideContext): Promise<boolean>;

    request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>>;
}

export class InformationRequester<
        TInformation,
        TInformationRequestContext extends InformationRequestContext<TInformation>
    >
    extends InfoRequester<TInformation, TInformationRequestContext>
    implements IInformationRequester<TInformation, TInformationRequestContext>
{
    willGetTrueInformation(context: InfoProvideContext): Promise<boolean> {
        return Promise.resolve(
            !context.requestedPlayer.drunk && !context.requestedPlayer.poisoned
        );
    }

    createContext(..._args: any[]): Promise<TInformationRequestContext> {
        throw new Error('Method not implemented.');
    }

    request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>> {
        return this._request(context);
    }

    _request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>> {
        return context.storyteller.giveInfo(context);
    }
}

export interface IStoryTellerInformationRequester<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>
> extends IInfoRequester<TInformation, TInformationRequestContext> {
    request(
        context: TInformationRequestContext
    ): Promise<StoryTellerInformation<TInformation>>;
}
