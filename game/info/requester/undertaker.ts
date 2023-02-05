import type { InfoProvideContext } from '../provider/provider';
import type {
    UndertakerInformationProviderContext,
    UndertakerInformation,
} from '../provider/undertaker';
import { InfoType } from '../info-type';
import {
    CharacterInformationRequester,
    IsAlive,
    EachNonfirstNight,
} from './common';
import { type InformationRequestContext } from './requester';
import { Undertaker } from '~/content/characters/output/undertaker';

export interface UndertakerInformationRequestContext<TInformation>
    extends InformationRequestContext<TInformation>,
        UndertakerInformationProviderContext {}

class BaseUndertakerInformationRequester<
    TInformationRequestContext extends UndertakerInformationRequestContext<UndertakerInformation>
> extends CharacterInformationRequester<
    UndertakerInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.UndertakerInformation;
    readonly expectedCharacter = Undertaker;

    async isEligible(context: InfoProvideContext): Promise<boolean> {
        return (
            (await super.isEligible(context)) &&
            context.clocktower.today.hasExecution
        );
    }
}

export interface UndertakerInformationRequester<
    TInformationRequestContext extends UndertakerInformationRequestContext<UndertakerInformation>
> extends BaseUndertakerInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UndertakerInformationRequester = IsAlive(
    EachNonfirstNight(BaseUndertakerInformationRequester)
);
