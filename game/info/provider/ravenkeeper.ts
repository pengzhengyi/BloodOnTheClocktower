import {
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
    type FalseInformation,
} from '../information';
import { InfoType } from '../info-type';
import { type InfoProvideContext, InformationProvider } from './provider';
import { Generator, type LazyMap } from '~/game/collections';
import type { IPlayer } from '~/game/player/player';
import type { CharacterToken } from '~/game/character/character';

/**
 * {@link `ravenkeeper["ability"]`}
 * "If you die at night, you are woken to choose a player: you learn their character."
 */
export interface RavenkeeperInformation {
    chosenPlayer: IPlayer;
    character: CharacterToken;
}

export interface RavenkeeperInformationProviderContext
    extends InfoProvideContext {
    chosenPlayer: IPlayer;
}

export class RavenkeeperInformationProvider<
    TInfoProvideContext extends RavenkeeperInformationProviderContext
> extends InformationProvider<TInfoProvideContext, RavenkeeperInformation> {
    readonly infoType = InfoType.RavenkeeperInformation;

    async getTrueInformationOptions(
        context: RavenkeeperInformationProviderContext
    ): Promise<TrueInformationOptions<RavenkeeperInformation>> {
        const perceivedCharacter = await context.chosenPlayer.from(
            context.requestedPlayer
        ).character;
        return Generator.once([
            Information.true({
                chosenPlayer: context.chosenPlayer,
                character: perceivedCharacter,
            } as RavenkeeperInformation),
        ]);
    }

    getFalseInformationOptions(
        context: RavenkeeperInformationProviderContext
    ): Promise<FalseInformationOptions<RavenkeeperInformation>> {
        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (character) =>
                        Information.false({
                            chosenPlayer: context.chosenPlayer,
                            character,
                        }) as FalseInformation<RavenkeeperInformation>,
                    context.characterSheet.characters
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual character and provided character in information match , -1 otherwise.
     */
    async evaluateGoodness(
        information: RavenkeeperInformation,
        context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        return (await context.chosenPlayer.character) === information.character
            ? 1
            : -1;
    }
}
