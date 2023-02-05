import { Generator } from './collections';
import { Singleton } from './common';
import type { IGameConfiguration } from './configuration/configuration';
import { DefaultStaticGameConfiguration } from './configuration/configuration';
import type { Edition, EditionName } from './edition';
import { EditionLoader, type IEditionLoader } from './edition-loader';
import {
    EditionNotSpecifiedMinimumNumberOfPlayers,
    GameHasTooFewPlayers,
    GameHasTooManyPlayers,
    RecoverableGameError,
} from './exception';
import type { IInfoProviderLoader } from './info/provider/loader';
import { InfoProviderLoader } from './info/provider/loader';
import type { NumberOfCharacters } from './script-tool';
import type { IEnvironment, IEnvironmentProvider } from './types';
import { InteractionEnvironment } from '~/interaction/environment';

export interface IGameEnvironment extends IEnvironment {
    editionLoader: IEditionLoader;
    infoProviderLoader: IInfoProviderLoader;
    configuration: IGameConfiguration;

    // utility methods
    getSupportedEditions(): Promise<Array<typeof Edition>>;

    recommendCharacterTypeComposition(
        numPlayers: number,
        editionName: EditionName
    ): Promise<NumberOfCharacters>;

    recommendCharacterTypeCompositionWithTravellerUpperbound(
        numPlayers: number,
        editionName: EditionName,
        maximumAcceptableNumTravellers?: number
    ): Promise<Array<NumberOfCharacters>>;
}

export interface IGameEnvironmentProvider
    extends IEnvironmentProvider<IGameEnvironment> {}

const BaseGameEnvironment: IGameEnvironment = class BaseGameEnvironment {
    static editionLoader: IEditionLoader = EditionLoader;

    static get infoProviderLoader(): IInfoProviderLoader {
        return InfoProviderLoader.getInstance();
    }

    static configuration: IGameConfiguration = DefaultStaticGameConfiguration;

    protected static supportedEditions?: Array<typeof Edition>;

    static async getSupportedEditions(): Promise<Array<typeof Edition>> {
        if (this.supportedEditions === undefined) {
            const supportedEditionNames: Array<string> =
                this.configuration.supportedEditions;
            const supportedEditions = await Generator.promiseAll(
                Generator.toPromise(
                    (editionName) => this.editionLoader.loadAsync(editionName),
                    supportedEditionNames
                )
            );

            this.supportedEditions = supportedEditions;
        }

        return this.supportedEditions;
    }

    static async recommendCharacterTypeComposition(
        numPlayers: number,
        editionName: EditionName
    ): Promise<NumberOfCharacters> {
        const assignment = await RecoverableGameError.catch(
            () =>
                this.tryRecommendCharacterTypeComposition(
                    numPlayers,
                    editionName
                ),
            (error) =>
                this.manuallyDetermineCharacterTypeComposition(
                    numPlayers,
                    editionName,
                    error
                )
        );

        return assignment;
    }

    static async recommendCharacterTypeCompositionWithTravellerUpperbound(
        numPlayers: number,
        editionName: EditionName,
        maximumAcceptableNumTravellers = 0
    ): Promise<Array<NumberOfCharacters>> {
        const assignmentPromises = Generator.toPromise(
            async (numTravellersToAssign) => {
                const assignment = await this.recommendCharacterTypeComposition(
                    numPlayers - numTravellersToAssign,
                    editionName
                );
                assignment.traveller = numTravellersToAssign;
                return assignment;
            },
            Generator.range(0, maximumAcceptableNumTravellers + 1)
        );

        const assignments = await RecoverableGameError.catch(
            () => Generator.promiseAll(assignmentPromises),
            async (error) => {
                const manualChosenAssignment =
                    await this.manuallyDetermineCharacterTypeComposition(
                        numPlayers,
                        editionName,
                        error
                    );
                return [manualChosenAssignment];
            }
        );

        return assignments;
    }

    protected static validateNumberOfPlayers(
        numPlayers: number,
        editionName: EditionName
    ): void {
        const recommendedMinimum =
            this.configuration.minimumNumberOfPlayers[editionName];

        if (recommendedMinimum === undefined) {
            throw new EditionNotSpecifiedMinimumNumberOfPlayers(editionName);
        }

        if (numPlayers < recommendedMinimum) {
            throw new GameHasTooFewPlayers(numPlayers, recommendedMinimum);
        } else if (numPlayers > this.configuration.maximumNumberOfPlayers) {
            throw new GameHasTooManyPlayers(
                numPlayers,
                this.configuration.maximumNumberOfPlayers
            );
        }
    }

    protected static async manuallyDetermineCharacterTypeComposition(
        numPlayers: number,
        editionName: EditionName,
        error: RecoverableGameError
    ): Promise<NumberOfCharacters> {
        // TODO properly get number of characters for each character type from storyteller
        const assignment =
            await InteractionEnvironment.current.gameUI.storytellerDecide<NumberOfCharacters>(
                `choose number of characters for each character type for ${numPlayers} in ${editionName} as ${error}`,
                false
            );
        return assignment!;
    }

    protected static tryRecommendCharacterTypeComposition(
        numPlayers: number,
        editionName: EditionName
    ): Promise<NumberOfCharacters> {
        this.validateNumberOfPlayers(numPlayers, editionName);

        const numTraveller = Math.max(
            0,
            numPlayers -
                this.configuration
                    .maximumNumberOfPlayersBeforeNecessaryTraveller[editionName]
        );
        const numPlayersWithoutTraveller = numPlayers - numTraveller;

        const assignment =
            this.configuration.recommendedCharacterTypeCompositions.get(
                numPlayersWithoutTraveller
            ) as NumberOfCharacters;
        assignment.traveller = numTraveller;
        return Promise.resolve(assignment);
    }
};

class BaseGameEnvironmentProvider implements IGameEnvironmentProvider {
    get current(): IGameEnvironment {
        return BaseGameEnvironment;
    }
}
const GameEnvironmentProvider = Singleton<BaseGameEnvironmentProvider>(
    BaseGameEnvironmentProvider
);

export const GameEnvironment: IGameEnvironmentProvider =
    GameEnvironmentProvider.getInstance();
