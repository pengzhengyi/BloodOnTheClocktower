/* eslint-disable no-dupe-class-members */
import type { InfoOptions } from '../info';
import type {
    IInfoRequester,
    InfoRequestContext,
} from '../requester/requester';
import { ChefInformationRequester } from '../requester/chef';
import { DemonInformationRequester } from '../requester/demon';
import { EmpathInformationRequester } from '../requester/empath';
import { FortuneTellerInformationRequester } from '../requester/fortuneteller';
import { InvestigatorInformationRequester } from '../requester/investigator';
import { LibrarianInformationRequester } from '../requester/librarian';
import { MinionInformationRequester } from '../requester/minion';
import { RavenkeeperInformationRequester } from '../requester/ravenkeeper';
import { SpyInformationRequester } from '../requester/spy';
import { TravellerInformationRequester } from '../requester/traveller';
import { UndertakerInformationRequester } from '../requester/undertaker';
import { WasherwomanInformationRequester } from '../requester/washerwoman';
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
    InfoProvider,
    InfoProvideContext,
    IStoryTellerInformationProvider,
    IInformationProvider,
} from './provider';
import type { Constructor } from '~/game/types';
import { LazyMap } from '~/game/collections';

type InfoProviderConstructor<TInformation> = Constructor<
    InfoProvider<TInformation>
>;

type InfoProviderMethod<
    TInformation,
    TInfoProvideContext extends InfoProvideContext
> = (context: TInfoProvideContext) => Promise<InfoOptions<TInformation>>;

export interface IInfoProviderLoader<TInformation = any> {
    loadMethod(
        requester: IInfoRequester<
            TInformation,
            InfoRequestContext<TInformation>
        >,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ):
        | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
        | undefined;

    loadProvider(
        requester: IInfoRequester<
            TInformation,
            InfoRequestContext<TInformation>
        >
    ): InfoProvider<TInformation> | undefined;
}

export class InfoProviderLoader<TInformation = any>
    implements IInfoProviderLoader<TInformation>
{
    protected providers: LazyMap<
        InfoProviderConstructor<TInformation>,
        InfoProvider<TInformation>
    > = new LazyMap((InfoProviderClass) => new InfoProviderClass());

    loadMethod(
        requester: IInfoRequester<
            TInformation,
            InfoRequestContext<TInformation>
        >,
        isStoryTellerInformation: boolean,
        willGetTrueInformation?: boolean
    ):
        | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
        | undefined {
        const infoProvider = this.loadProvider(requester);

        if (infoProvider === undefined) {
            return undefined;
        }

        let method:
            | InfoProviderMethod<TInformation, InfoRequestContext<TInformation>>
            | undefined;
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

        return method?.bind(infoProvider);
    }

    loadProvider(
        requester: IInfoRequester<
            TInformation,
            InfoRequestContext<TInformation>
        >
    ): InfoProvider<TInformation> | undefined {
        if (requester instanceof WasherwomanInformationRequester) {
            return this.providers.get(WasherwomanInformationProvider);
        } else if (requester instanceof LibrarianInformationRequester) {
            return this.providers.get(LibrarianInformationProvider);
        } else if (requester instanceof InvestigatorInformationRequester) {
            return this.providers.get(InvestigatorInformationProvider);
        } else if (requester instanceof ChefInformationRequester) {
            return this.providers.get(ChefInformationProvider);
        } else if (requester instanceof EmpathInformationRequester) {
            return this.providers.get(EmpathInformationProvider);
        } else if (requester instanceof FortuneTellerInformationRequester) {
            return this.providers.get(FortuneTellerInformationProvider);
        } else if (requester instanceof UndertakerInformationRequester) {
            return this.providers.get(UndertakerInformationProvider);
        } else if (requester instanceof RavenkeeperInformationRequester) {
            return this.providers.get(RavenkeeperInformationProvider);
        } else if (requester instanceof SpyInformationRequester) {
            return this.providers.get(SpyInformationProvider);
        } else if (requester instanceof DemonInformationRequester) {
            return this.providers.get(DemonInformationProvider);
        } else if (requester instanceof MinionInformationRequester) {
            return this.providers.get(MinionInformationProvider);
        } else if (requester instanceof TravellerInformationRequester) {
            return this.providers.get(TravellerInformationProvider);
        }
    }
}
