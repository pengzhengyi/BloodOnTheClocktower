import type { NumberOfCharacters as Assignment } from './script-tool';
import type { TravellerCharacterToken } from './character';
import { Environment } from '~/interaction/environment';

/**
 * {@link `glossary["Traveller Sheet"]`}
 * The sheet placed under the Town Square. It lists how many Outsiders and Minions are in the current game and what the Travellers’ abilities are.
 */
export class TravellerSheet {
    static chooseTravellerCharacters(
        travellerCharacters: Iterable<TravellerCharacterToken>,
        numTraveller: number
    ): Promise<Array<TravellerCharacterToken>> {
        return Environment.current.gameUI.storytellerChoose(
            travellerCharacters,
            numTraveller
        ) as Promise<Array<TravellerCharacterToken>>;
    }

    readonly defaultAssignment: Assignment;

    readonly actualAssignment: Assignment;

    readonly travellerCharacters: Array<TravellerCharacterToken>;

    protected constructor(
        defaultAssignment: Assignment,
        travellerCharacters: Array<TravellerCharacterToken>
    ) {
        this.defaultAssignment = defaultAssignment;
        this.actualAssignment = defaultAssignment;
        this.travellerCharacters = travellerCharacters;
    }
}
