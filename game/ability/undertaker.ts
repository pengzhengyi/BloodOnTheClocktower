import { UndertakerRequestInfoWhenNoExecution } from '../exception';
import type { UndertakerInformation } from '../info/provider/undertaker';
import {
    UndertakerInformationRequester,
    type UndertakerInformationRequestContext,
} from '../info/requester/undertaker';
import {
    GetCharacterInformationAbility,
    type GetInfoAbilityUseContext,
} from './ability';

export class GetUndertakerInformationAbility extends GetCharacterInformationAbility<
    UndertakerInformation,
    UndertakerInformationRequester<
        UndertakerInformationRequestContext<UndertakerInformation>
    >
> {
    /**
     * {@link `Undertaker["ability"]`}
     */
    static readonly description =
        'Each night*, you learn which character died by execution today.';

    protected infoRequester = new UndertakerInformationRequester<
        UndertakerInformationRequestContext<UndertakerInformation>
    >();

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<UndertakerInformationRequestContext<UndertakerInformation>> {
        const infoRequestContext = (await super.createRequestContext(
            context
        )) as Omit<
            UndertakerInformationRequestContext<UndertakerInformation>,
            'executedPlayer'
        >;

        const executedPlayer = context.clocktower.today.executed;

        if (executedPlayer === undefined) {
            throw new UndertakerRequestInfoWhenNoExecution(
                context.requestedPlayer,
                context
            );
        } else {
            (
                infoRequestContext as UndertakerInformationRequestContext<UndertakerInformation>
            ).executedPlayer = executedPlayer;
        }

        return infoRequestContext as UndertakerInformationRequestContext<UndertakerInformation>;
    }
}
