import type { NumberOfCharacters as Assignment } from './scripttool';
import type { TravellerCharacterToken } from './character';

/**
 * {@link `glossary["Traveller Sheet"]`}
 * The sheet placed under the Town Square. It lists how many Outsiders and Minions are in the current game and what the Travellers’ abilities are.
 */
export class TravellerSheet {
    readonly defaultAssignment: Assignment;

    readonly actualAssignment: Assignment;

    readonly travellerCharacters: Array<TravellerCharacterToken>;

    constructor(
        defaultAssignment: Assignment,
        actualAssignment: Assignment,
        travellerCharacters: Array<TravellerCharacterToken>
    ) {
        this.defaultAssignment = defaultAssignment;
        this.actualAssignment = actualAssignment;
        this.travellerCharacters = travellerCharacters;
    }
}
