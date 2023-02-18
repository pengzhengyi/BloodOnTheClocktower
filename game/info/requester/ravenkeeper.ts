import type { InfoProvideContext } from '../provider/provider';
import type {
    RavenkeeperInformationProviderContext,
    RavenkeeperInformation,
} from '../provider/ravenkeeper';
import { InfoType } from '../info-type';
import { CharacterInformationRequester, OnceAtNight } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

export interface RavenkeeperInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        RavenkeeperInformationProviderContext {}

class BaseRavenkeeperInformationRequester<
    TInformationRequestContext extends RavenkeeperInformationRequestContext<RavenkeeperInformation>
> extends CharacterInformationRequester<
    RavenkeeperInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.RavenkeeperInformation;
    readonly origin = CharacterIds.Ravenkeeper;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) && this.hasDiedAtNight(context)
        );
    }

    protected hasDiedAtNight(context: InfoProvideContext): boolean {
        return context.clocktower.today.hasDiedAtNight(context.requestedPlayer);
    }
}

export interface RavenkeeperInformationRequester<
    TInformationRequestContext extends RavenkeeperInformationRequestContext<RavenkeeperInformation>
> extends BaseRavenkeeperInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RavenkeeperInformationRequester = OnceAtNight(
    BaseRavenkeeperInformationRequester
);
