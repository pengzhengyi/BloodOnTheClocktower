import { type EditionData, EditionKeyName } from '../types';
import { IncompleteEditionData } from '../exception/incomplete-edition-data';
import { lowercaseLetters } from '../common';

export enum EditionName {
    TroubleBrewing = 'Trouble Brewing',
    SectsViolets = 'Sects & Violets',
    BadMoonRising = 'Bad Moon Rising',
    ExperimentalCharacters = 'Experimental Characters',
}

/**
 * {@link `glossary["Edition"]`}
 * A scenario of Clocktower that contains a set of tokens, character sheets, and a character almanac. For example, Trouble Brewing. Each edition has a unifying theme, strategy, and tone.
 */
export abstract class Edition {
    static REQUIRED_KEYNAMES = [EditionKeyName.CHARACTERS];

    static editionData: Partial<EditionData>;

    static get canonicalName(): string {
        return this.getCanonicalName(this.name);
    }

    static is(edition: typeof Edition): boolean {
        return Object.is(this, edition);
    }

    static getCanonicalName(name: string) {
        return lowercaseLetters(name);
    }

    static areSameNames(firstEditionName: string, secondEditionName: string) {
        return (
            this.getCanonicalName(firstEditionName) ===
            this.getCanonicalName(secondEditionName)
        );
    }

    static initialize(editionData: Partial<EditionData>) {
        this.checkForRequiredKeyNames(editionData);
        this.editionData = editionData;
    }

    static equals(otherEdition: typeof Edition) {
        return this.canonicalName === otherEdition.canonicalName;
    }

    static toJSON() {
        return this.editionData;
    }

    protected static checkForRequiredKeyNames(
        editionData: Partial<EditionData>
    ) {
        for (const requiredKeyName of this.REQUIRED_KEYNAMES) {
            if (editionData[requiredKeyName] === undefined) {
                throw new IncompleteEditionData(editionData, requiredKeyName);
            }
        }
    }

    protected constructor() {
        throw new Error(
            'Cannot instantiate Edition, meant to use as static class.'
        );
    }
}

export function createCustomEdition(
    editionData: Partial<EditionData>
): typeof Edition {
    const customEdition = class extends Edition {};
    customEdition.initialize(editionData);
    return customEdition;
}
