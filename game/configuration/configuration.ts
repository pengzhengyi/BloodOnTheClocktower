import path from 'path';
import { Singleton } from '../common';
import type { EditionId } from '../edition/edition-id';
import { EditionIds } from '../edition/edition-id';
import { createRecordProxy } from '../proxy/proxy';
import type { NumberOfCharacters } from '../script-tool';

export interface IGameConfiguration {
    readonly characterDefinitionFolderPath: string;
    readonly editionDefinitionFolderPath: string;
    readonly maximumNumberOfPlayers: number;
    readonly supportedEditions: Array<EditionId>;
    readonly recommendedCharacterTypeCompositions: Map<
        number,
        NumberOfCharacters
    >;

    readonly minimumNumberOfPlayers: Record<EditionId, number>;
    readonly maximumNumberOfPlayersBeforeNecessaryTraveller: Record<
        EditionId,
        number
    >;
}

/**
 * TODO This is an initial implementation for game configuration. Should substitute with more mature configuration like JSON file based.
 */
class BaseDefaultStaticGameConfiguration implements IGameConfiguration {
    protected static readonly CONFIGURATION_DIR = path.resolve(__dirname);
    protected static readonly CONTENT_DIR = path.join(
        this.CONFIGURATION_DIR,
        '../..',
        'content'
    );

    get characterDefinitionFolderPath(): string {
        const filepath = path.join(
            BaseDefaultStaticGameConfiguration.CONTENT_DIR,
            'characters/output'
        );
        return filepath;
    }

    get editionDefinitionFolderPath(): string {
        const filepath = path.join(
            BaseDefaultStaticGameConfiguration.CONTENT_DIR,
            'editions'
        );
        return filepath;
    }

    readonly maximumNumberOfPlayers: number = 20;

    readonly supportedEditions: Array<EditionId> = [EditionIds.TroubleBrewing];

    readonly minimumNumberOfPlayers: Record<EditionId, number> =
        createRecordProxy<number>((editionId) =>
            editionId === EditionIds.TroubleBrewing ? 5 : 7
        );

    readonly maximumNumberOfPlayersBeforeNecessaryTraveller: Record<
        EditionId,
        number
    > = createRecordProxy<number>((_editionId) => 15);

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
