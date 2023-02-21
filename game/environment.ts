import { Generator } from './collections';
import { Singleton } from './common';
import type { IGameConfiguration } from './configuration/configuration';
import { DefaultStaticGameConfiguration } from './configuration/configuration';
import type { IEdition } from './edition/edition';
import { EditionLoader, type IEditionLoader } from './edition/edition-loader';
import { RecoverableGameError } from './exception/exception';
import type { IInfoProviderLoader } from './info/provider/info-provider-loader';
import { InfoProviderLoader } from './info/provider/info-provider-loader';
import type { NumberOfCharacters } from './script-tool';
import type { EditionData, IEnvironment, IEnvironmentProvider } from './types';
import type { ICharacterLoader } from './character/character-loader';
import { CharacterLoader } from './character/character-loader';
import { GameHasTooFewPlayers } from './exception/game-has-too-few-players';
import { GameHasTooManyPlayers } from './exception/game-has-too-many-players';
import { EditionNotSpecifiedMinimumNumberOfPlayers } from './exception/edition-not-specified-minimum-number-of-players';

import {
    CharacterFromDefinition,
    CharacterFromId,
} from './character/character-factory';

import { FileReaderBasedProvider as FileReaderBasedCharacterProvider } from './character/character-definition-provider';
import { FileReaderBasedProvider as FileReaderBasedEditionProvider } from './edition/edition-definition-provider';
import type { ICharacter } from './character/character';
import type { IEditionFromDefinition } from './edition/edition-factory';
import {
    EditionFromDefinition,
    EditionFromId,
} from './edition/edition-factory';
import type { EditionId } from './edition/edition-id';
import type { IAbilityLoader } from './ability/ability-loader';
import { AbilityLoader } from './ability/ability-loader';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface IGameEnvironment extends IEnvironment {
    editionLoader: IEditionLoader;
    infoProviderLoader: IInfoProviderLoader;
    abilityLoader: IAbilityLoader;
    configuration: IGameConfiguration;
    characterLoader: ICharacterLoader;

    // utility methods
    getSupportedEditions(): Promise<Array<IEdition>>;

    loadCharacter(characterId: string): ICharacter;

    loadCharacterAsync(characterId: string): Promise<ICharacter>;

    loadEdition(editionId: string): IEdition;

    loadEditionAsync(editionId: string): Promise<IEdition>;

    loadCustomEdition(definition: Partial<EditionData>): IEdition;

    recommendCharacterTypeComposition(
        numPlayers: number,
        editionId: EditionId
    ): Promise<NumberOfCharacters>;

    recommendCharacterTypeCompositionWithTravellerUpperbound(
        numPlayers: number,
        editionId: EditionId,
        maximumAcceptableNumTravellers?: number
    ): Promise<Array<NumberOfCharacters>>;
}

export interface IGameEnvironmentProvider
    extends IEnvironmentProvider<IGameEnvironment> {}

class BaseGameEnvironment implements IGameEnvironment {
    readonly editionLoader: IEditionLoader;
    readonly characterLoader: ICharacterLoader;
    readonly abilityLoader: IAbilityLoader;

    protected declare editionFromDefinition: IEditionFromDefinition;

    constructor() {
        this.characterLoader = this.createCharacterLoader();
        this.editionLoader = this.createEditionLoader();
        this.abilityLoader = this.createAbilityLoader();
    }

    get infoProviderLoader(): IInfoProviderLoader {
        return InfoProviderLoader.getInstance();
    }

    get configuration(): IGameConfiguration {
        return DefaultStaticGameConfiguration.getInstance();
    }

    protected supportedEditions?: Array<IEdition>;

    loadCharacter(characterId: string): ICharacter {
        return this.characterLoader.load(characterId);
    }

    loadCharacterAsync(characterId: string): Promise<ICharacter> {
        return this.characterLoader.loadAsync(characterId);
    }

    loadEdition(editionId: string): IEdition {
        return this.editionLoader.load(editionId);
    }

    loadEditionAsync(editionId: string): Promise<IEdition> {
        return this.editionLoader.loadAsync(editionId);
    }

    loadCustomEdition(definition: Partial<EditionData>): IEdition {
        return this.editionFromDefinition.getEdition(definition);
    }

    async getSupportedEditions(): Promise<Array<IEdition>> {
        if (this.supportedEditions === undefined) {
            const supportedEditionIds: Array<EditionId> =
                this.configuration.supportedEditions;
            const supportedEditions = await Generator.promiseAll(
                Generator.toPromise(
                    (editionId) => this.editionLoader.loadAsync(editionId),
                    supportedEditionIds
                )
            );

            this.supportedEditions = supportedEditions;
        }

        return this.supportedEditions;
    }

    async recommendCharacterTypeComposition(
        numPlayers: number,
        editionId: EditionId
    ): Promise<NumberOfCharacters> {
        const assignment = await RecoverableGameError.catch(
            () =>
                this.tryRecommendCharacterTypeComposition(
                    numPlayers,
                    editionId
                ),
            (error) =>
                this.manuallyDetermineCharacterTypeComposition(
                    numPlayers,
                    editionId,
                    error
                )
        );

        return assignment;
    }

    async recommendCharacterTypeCompositionWithTravellerUpperbound(
        numPlayers: number,
        editionId: EditionId,
        maximumAcceptableNumTravellers = 0
    ): Promise<Array<NumberOfCharacters>> {
        const assignmentPromises = Generator.toPromise(
            async (numTravellersToAssign) => {
                const assignment = await this.recommendCharacterTypeComposition(
                    numPlayers - numTravellersToAssign,
                    editionId
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
                        editionId,
                        error
                    );
                return [manualChosenAssignment];
            }
        );

        return assignments;
    }

    protected validateNumberOfPlayers(
        numPlayers: number,
        editionId: EditionId
    ): void {
        const recommendedMinimum =
            this.configuration.minimumNumberOfPlayers[editionId];

        if (recommendedMinimum === undefined) {
            throw new EditionNotSpecifiedMinimumNumberOfPlayers(editionId);
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

    protected async manuallyDetermineCharacterTypeComposition(
        numPlayers: number,
        editionId: EditionId,
        error: RecoverableGameError
    ): Promise<NumberOfCharacters> {
        // TODO properly get number of characters for each character type from storyteller
        const reason = `choose number of characters for each character type for ${numPlayers} in ${editionId} as ${error}`;
        const decision =
            await InteractionEnvironment.current.gameUI.storytellerDecide<NumberOfCharacters>(
                {},
                { reason }
            );
        return decision.decided;
    }

    protected tryRecommendCharacterTypeComposition(
        numPlayers: number,
        editionId: EditionId
    ): Promise<NumberOfCharacters> {
        this.validateNumberOfPlayers(numPlayers, editionId);

        const numTraveller = Math.max(
            0,
            numPlayers -
                this.configuration
                    .maximumNumberOfPlayersBeforeNecessaryTraveller[editionId]
        );
        const numPlayersWithoutTraveller = numPlayers - numTraveller;

        const assignment =
            this.configuration.recommendedCharacterTypeCompositions.get(
                numPlayersWithoutTraveller
            ) as NumberOfCharacters;
        assignment.traveller = numTraveller;
        return Promise.resolve(assignment);
    }

    protected createCharacterLoader() {
        const characterFromDefinition = new CharacterFromDefinition();
        const characterDefinitionProvider =
            new FileReaderBasedCharacterProvider(
                this.configuration.characterDefinitionFolderPath
            );
        const characterFromId = new CharacterFromId(
            characterFromDefinition,
            characterDefinitionProvider
        );
        return new CharacterLoader(characterFromId);
    }

    protected createEditionLoader() {
        this.editionFromDefinition = new EditionFromDefinition();
        const editionDefinitionProvider = new FileReaderBasedEditionProvider(
            this.configuration.editionDefinitionFolderPath
        );
        const editionFromId = new EditionFromId(
            this.editionFromDefinition,
            editionDefinitionProvider
        );
        return new EditionLoader(editionFromId);
    }

    protected createAbilityLoader() {
        const abilityLoader = new AbilityLoader(this.characterLoader);
        return abilityLoader;
    }
}

const GameEnvironment = Singleton<BaseGameEnvironment>(BaseGameEnvironment);

// since singleton once exposes getInstance, we need to wrap in a utility class so that it has a current property meeting requirement
abstract class GameEnvironmentProvider {
    static get current(): IGameEnvironment {
        return GameEnvironment.getInstance();
    }
}
// enforce GameEnvironmentProvider not instantiable
const GameEnvironmentProvider_: IGameEnvironmentProvider =
    GameEnvironmentProvider;

export { GameEnvironmentProvider_ as GameEnvironment };
