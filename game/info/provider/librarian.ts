import {
    type OneOfTwoPlayersIsOutsider,
    type TrueInformationOptions,
    Information,
    type FalseInformationOptions,
    type FalseInformation,
} from '../information';
import { OneOfTwoPlayersHasCharacterTypeInformationProvider } from './common';
import { type InfoProvideContext } from './provider';
import { type CharacterType, Outsider } from '~/game/character/character-type';
import { type Generator } from '~/game/collections';

export type LibrarianNoOutsiderInformation = {
    noOutsiders: true;
};
export type LibrarianInformation =
    | OneOfTwoPlayersIsOutsider
    | LibrarianNoOutsiderInformation;

export class LibrarianInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    OneOfTwoPlayersIsOutsider
> {
    static readonly NO_OUTSIDER_INFORMATION: LibrarianInformation = {
        noOutsiders: true,
    };

    protected expectedCharacterType: typeof CharacterType = Outsider;

    async evaluateGoodness(
        information: LibrarianInformation,
        context: TInfoProvideContext
    ): Promise<number> {
        if ((information as LibrarianNoOutsiderInformation).noOutsiders) {
            // TODO .catch CannotDetermineCharacterType
            return await context.players
                .toPromise((player) => player.isOutsider)
                .mapAsync((isOutsider) => (isOutsider ? -1 : 1))
                .promiseAll()
                .then((scores) =>
                    scores.reduce(
                        (prevValue, newValue) => prevValue + newValue,
                        0
                    )
                );
        } else {
            return await super.evaluateGoodness(
                information as OneOfTwoPlayersIsOutsider,
                context
            );
        }
    }

    // @ts-ignore: allow different return type for overridden method
    async getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<LibrarianInformation>> {
        const infoOptions = (await super.getTrueInformationOptions(
            context
        )) as TrueInformationOptions<LibrarianInformation>;
        const options: TrueInformationOptions<LibrarianInformation> =
            infoOptions.orElse(
                Information.true(
                    LibrarianInformationProvider.NO_OUTSIDER_INFORMATION
                )
            );

        return options;
    }

    // @ts-ignore: allow different return type for overridden method
    async getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<LibrarianInformation>> {
        const infoOptions = (await super.getFalseInformationOptions(
            context
        )) as Generator<FalseInformation<LibrarianInformation>>;
        const options: Generator<FalseInformation<LibrarianInformation>> =
            infoOptions.push(
                Information.false({
                    noOutsiders: true,
                }) as FalseInformation<LibrarianInformation>
            );

        return options;
    }
}
