import {
    TrueInformationOptions,
    Information,
    FalseInformationOptions,
    FalseInformation,
} from '../information';
import { InfoProvideContext, InformationProvider } from './provider';
import { Generator, LazyMap } from '~/game/collections';
import type { Player } from '~/game/player';
import type { CharacterToken } from '~/game/character';

/**
 * {@link `undertaker["ability"]`}
 * "Each night*, you learn which character died by execution today."
 */
export interface UndertakerInformation {
    executedPlayer: Player;
    character: CharacterToken;
}

export interface UndertakerInformationProviderContext
    extends InfoProvideContext {
    executedPlayer: Player;
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
