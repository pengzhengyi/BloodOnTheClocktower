import {
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
} from '../information';
import { InfoType } from '../info-type';
import { DemonMinionInformationProvider } from './common';
import { type InfoProvideContext } from './provider';
import { Generator } from '~/game/collections';
import type { DemonPlayer } from '~/game/types';

/**
 * If travellers are evil, they learn who the Demon is; they do not learn any additional evil characters or receive any bluffs.
 */
export interface TravellerInformation {
    demon: DemonPlayer;
}

export class TravellerInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends DemonMinionInformationProvider<
    TInfoProvideContext,
    TravellerInformation
> {
    readonly infoType = InfoType.TravellerInformation;

    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TravellerInformation>> {
        const demon = await this.getDemonPlayer(context);

        return Promise.resolve(
            Generator.once([
                Information.true({
                    demon,
                }),
            ])
        );
    }

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TravellerInformation>> {
        const hypotheticalCandidatesForDemon = context.players.isNot(
            context.requestedPlayer
        );

        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (demon) =>
                        Information.false({
                            demon,
                        }),
                    hypotheticalCandidatesForDemon
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 provided player is the demon, -1 otherwise.
     */
    async evaluateGoodness(
        information: TravellerInformation,
        _context: TInfoProvideContext
    ): Promise<number> {
        return (await information.demon.isDemon) ? 1 : -1;
    }
}
