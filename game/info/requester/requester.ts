import type { Info } from '../info';
import type { InfoType } from '../info-type';
import type { Information } from '../information';
import type { InfoProvideContext } from '../provider/provider';
import type { StoryTellerInformation } from '../storyteller-information';
import type { RequireInfoType } from '~/game/types';

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
> extends RequireInfoType {
    isEligible(context: InfoProvideContext): Promise<boolean>;

    request(context: TInfoRequestContext): Promise<Info<TInformation>>;

    createContext(...args: any[]): Promise<TInfoRequestContext>;
}

export abstract class InfoRequester<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>
> implements IInfoRequester<TInformation, TInfoRequestContext>
{
    abstract readonly infoType: InfoType;

    request(context: TInfoRequestContext): Promise<Info<TInformation>> {
        return this.getInfo(context);
    }

    isEligible(_context: InfoProvideContext): Promise<boolean> {
        return Promise.resolve(true);
    }

    createContext(..._args: any[]): Promise<TInfoRequestContext> {
        throw new Error('Method not implemented.');
    }

    protected getInfo(
        context: TInfoRequestContext
    ): Promise<Info<TInformation>> {
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

export abstract class InformationRequester<
        TInformation,
        TInformationRequestContext extends InformationRequestContext<TInformation>
    >
    extends InfoRequester<TInformation, TInformationRequestContext>
    implements IInformationRequester<TInformation, TInformationRequestContext>
{
    willGetTrueInformation(context: InfoProvideContext): Promise<boolean> {
        return context.requestedPlayer.willGetTrueInformation;
    }

    request(
        context: TInformationRequestContext
    ): Promise<Information<TInformation>> {
        return super.request(context) as Promise<Information<TInformation>>;
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
