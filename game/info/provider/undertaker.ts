import {
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
    type FalseInformation,
} from '../information';
import { type InfoProvideContext, InformationProvider } from './provider';
import { Generator, type LazyMap } from '~/game/collections';
import type { IPlayer } from '~/game/player';
import type { CharacterToken } from '~/game/character/character';

/**
 * {@link `undertaker["ability"]`}
 * "Each night*, you learn which character died by execution today."
 */
export interface UndertakerInformation {
    executedPlayer: IPlayer;
    character: CharacterToken;
}

export interface UndertakerInformationProviderContext
    extends InfoProvideContext {
    executedPlayer: IPlayer;
}

export class UndertakerInformationProvider<
    TInfoProvideContext extends UndertakerInformationProviderContext
> extends InformationProvider<TInfoProvideContext, UndertakerInformation> {
    async getTrueInformationOptions(
        context: UndertakerInformationProviderContext
    ): Promise<TrueInformationOptions<UndertakerInformation>> {
        const perceivedCharacter = await context.executedPlayer.from(
            context.requestedPlayer
        ).character;
        return Generator.once([
            Information.true({
                executedPlayer: context.executedPlayer,
                character: perceivedCharacter,
            } as UndertakerInformation),
        ]);
    }

    getFalseInformationOptions(
        context: UndertakerInformationProviderContext
    ): Promise<FalseInformationOptions<UndertakerInformation>> {
        return Promise.resolve(
            Generator.once(
                Generator.map(
                    (character) =>
                        Information.false({
                            executedPlayer: context.executedPlayer,
                            character,
                        }) as FalseInformation<UndertakerInformation>,
                    context.characterSheet.characters
                )
            )
        );
    }

    /**
     * @override Goodness is evaluated on the following criterion: 1 if actual character and provided character in information match , -1 otherwise.
     */
    async evaluateGoodness(
        information: UndertakerInformation,
        context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        return (await context.executedPlayer.character) ===
            information.character
            ? 1
            : -1;
    }
}
