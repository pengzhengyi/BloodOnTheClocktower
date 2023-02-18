import path from 'path';
import { Singleton } from '../common';
import { Edition, EditionName } from '../edition/edition';
import { createRecordProxy } from '../proxy/proxy';
import type { NumberOfCharacters } from '../script-tool';

export interface IGameConfiguration {
    readonly characterDefinitionFolderPath: string;
    readonly maximumNumberOfPlayers: number;
    readonly supportedEditions: Array<string>;
    readonly recommendedCharacterTypeCompositions: Map<
        number,
        NumberOfCharacters
    >;

    readonly minimumNumberOfPlayers: Record<EditionName, number>;
    readonly maximumNumberOfPlayersBeforeNecessaryTraveller: Record<
        EditionName,
        number
    >;
}

/**
 * TODO This is an initial implementation for game configuration. Should substitute with more mature configuration like JSON file based.
 */
class BaseDefaultStaticGameConfiguration implements IGameConfiguration {
    get characterDefinitionFolderPath(): string {
        const currentDirectory = path.resolve(__dirname);
        const filepath = path.join(
            currentDirectory,
            '../..',
            'content/characters/output'
        );
        return filepath;
    }

    readonly maximumNumberOfPlayers: number = 20;

    readonly supportedEditions: Array<string> = [EditionName.TroubleBrewing];

    readonly minimumNumberOfPlayers: Record<EditionName, number> =
        createRecordProxy<number>((editionName) =>
            Edition.areSameNames(editionName, EditionName.TroubleBrewing)
                ? 5
                : 7
        );

    readonly maximumNumberOfPlayersBeforeNecessaryTraveller: Record<
        EditionName,
        number
    > = createRecordProxy<number>((_editionName) => 15);

    readonly recommendedCharacterTypeCompositions: Map<
        number,
        NumberOfCharacters
    > = new Map([
        [
            5,
            {
                townsfolk: 3,
                outsider: 0,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            6,
            {
                townsfolk: 3,
                outsider: 1,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            7,
            {
                townsfolk: 5,
                outsider: 0,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            8,
            {
                townsfolk: 5,
                outsider: 1,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            9,
            {
                townsfolk: 5,
                outsider: 2,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            10,
            {
                townsfolk: 7,
                outsider: 0,
                minion: 2,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            11,
            {
                townsfolk: 7,
                outsider: 1,
                minion: 2,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            12,
            {
                townsfolk: 7,
                outsider: 2,
                minion: 2,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            13,
            {
                townsfolk: 9,
                outsider: 0,
                minion: 3,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            14,
            {
                townsfolk: 9,
                outsider: 1,
                minion: 3,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            15,
            {
                townsfolk: 9,
                outsider: 2,
                minion: 3,
                demon: 1,
                traveller: 0,
            },
        ],
    ]);
}

export const DefaultStaticGameConfiguration =
    Singleton<BaseDefaultStaticGameConfiguration>(
        BaseDefaultStaticGameConfiguration
    );
