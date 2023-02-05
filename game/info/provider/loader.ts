/* eslint-disable no-dupe-class-members */
import type { InfoOptions } from '../info';
import type { InfoRequestContext } from '../requester/requester';
import type { InfoType } from '../info-type';
import { ChefInformationProvider } from './chef';
import { DemonInformationProvider } from './demon';
import { EmpathInformationProvider } from './empath';
import { FortuneTellerInformationProvider } from './fortuneteller';
import { InvestigatorInformationProvider } from './investigator';
import { LibrarianInformationProvider } from './librarian';
import { MinionInformationProvider } from './minion';
import { RavenkeeperInformationProvider } from './ravenkeeper';
import { SpyInformationProvider } from './spy';
import { TravellerInformationProvider } from './traveller';
import { UndertakerInformationProvider } from './undertaker';
import { WasherwomanInformationProvider } from './washerwoman';
import type {
    InfoProvideContext,
    IStoryTellerInformationProvider,
    IInformationProvider,
    IInfoProvider,
} from './provider';
import type { NoParamConstructor } from '~/game/types';
import { Generator } from '~/game/collections';
import { NoDefinedInfoProvider } from '~/game/exception';
import { Singleton } from '~/game/common';

type InfoProviderMethod<
    TInformation,
    TInfoProvideContext extends InfoProvideContext
> = (context: TInfoProvideContext) => Promise<InfoOptions<TInformation>>;

export interface IInfoProviderLoader {
    tryLoadMethod<TInformation>(
        infoTye: InfoType,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ):
        | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
        | undefined;

    loadMethod<TInformation>(
        infoType: InfoType,
        isStoryTellerInformation: boolean,
        willGetTrueInformation: boolean | undefined
    ): InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>;
}

const InfoProviderClasses: Array<
    NoParamConstructor<IInfoProvider<InfoProvideContext, any>>
> = [
    WasherwomanInformationProvider,
    LibrarianInformationProvider,
    InvestigatorInformationProvider,
    ChefInformationProvider,
    EmpathInformationProvider,
    FortuneTellerInformationProvider,
    UndertakerInformationProvider,
    RavenkeeperInformationProvider,
    SpyInformationProvider,
    DemonInformationProvider,
    MinionInformationProvider,
    TravellerInformationProvider,
];

class BaseInfoProviderLoader implements IInfoProviderLoader {
    protected static providers: Map<
        InfoType,
        IInfoProvider<InfoProvideContext, unknown>
    > = new Map(
        Generator.map(
            (infoProvider) => [infoProvider.infoType, infoProvider],
            Generator.map(
                (InfoProviderClass) => new InfoProviderClass(),
                InfoProviderClasses
            )
        )
    );

    tryLoadMethod<TInformation>(
        infoType: InfoType,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ):
        | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
        | undefined {
        const infoProvider = this.loadProvider(infoType);

        if (infoProvider === undefined) {
            return undefined;
        }

        return this.getLoadMethod(
            infoProvider,
            isStoryTellerInformation,
            willGetTrueInformation
        );
    }

    loadMethod<TInformation>(
        infoType: InfoType,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ): InfoProviderMethod<TInformation, InfoRequestContext<TInformation>> {
        const provideInfo = this.tryLoadMethod<TInformation>(
            infoType,
            isStoryTellerInformation,
            willGetTrueInformation
        );

        if (provideInfo === undefined) {
            throw new NoDefinedInfoProvider(infoType, this);
        } else {
            return provideInfo;
        }
    }

    protected loadProvider(
        infoType: InfoType
    ): IInfoProvider<InfoProvideContext, unknown> | undefined {
        return BaseInfoProviderLoader.providers.get(infoType);
    }

    protected getLoadMethod<TInformation>(
        infoProvider: IInfoProvider<InfoProvideContext, unknown>,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ): InfoProviderMethod<TInformation, InfoRequestContext<TInformation>> {
        let method: InfoProviderMethod<
            TInformation,
            InfoRequestContext<TInformation>
        >;
        if (isStoryTellerInformation) {
            method = (
                infoProvider as IStoryTellerInformationProvider<
                    InfoRequestContext<TInformation>,
                    TInformation
                >
            ).getStoryTellerInformationOptions;
        } else if (willGetTrueInformation !== undefined) {
            const informationProvider = infoProvider as IInformationProvider<
                InfoRequestContext<TInformation>,
                TInformation
            >;
            method = willGetTrueInformation
                ? informationProvider.getTrueInformationOptions
                : informationProvider.getFalseInformationOptions;
        }

        return method!.bind(infoProvider);
    }
}

export const InfoProviderLoader = Singleton<BaseInfoProviderLoader>(
    BaseInfoProviderLoader
);
