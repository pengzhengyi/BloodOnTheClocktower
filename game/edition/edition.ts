import type { TJSON } from '../types';
import { type EditionData, EditionKeyName } from '../types';
import { IncompleteEditionData } from '../exception/incomplete-edition-data';
import { lowercaseLetters } from '../common';
import type { EditionId } from './edition-id';

export interface IEdition {
    readonly definition: Partial<EditionData>;

    /* basic properties */
    readonly id: EditionId;
    readonly name: string;

    /* utility methods */
    toString(): string;
    toJSON(): TJSON;
}

/**
 * {@link `glossary["Edition"]`}
 * A scenario of Clocktower that contains a set of tokens, character sheets, and a character almanac. For example, Trouble Brewing. Each edition has a unifying theme, strategy, and tone.
 */
export class Edition implements IEdition {
    static REQUIRED_KEYNAMES = [EditionKeyName.CHARACTERS, EditionKeyName.NAME];

    readonly definition: Partial<EditionData>;

    static getCanonicalId(name: string) {
        return lowercaseLetters(name) as EditionId;
    }

    get id() {
        const id = this.definition[EditionKeyName.NAME];
        if (id === undefined) {
            throw new IncompleteEditionData(
                this.definition,
                EditionKeyName.NAME
            );
        }
        return Edition.getCanonicalId(id);
    }

    get name() {
        const name = this.definition[EditionKeyName.NAME];
        if (name === undefined) {
            throw new IncompleteEditionData(
                this.definition,
                EditionKeyName.NAME
            );
        }
        return name;
    }

    protected constructor(definition: Partial<EditionData>) {
        this.definition = definition;
        this.initialize(definition);
    }

    toJSON() {
        return this.id;
    }

    toString() {
        return `${this.name}`;
    }

    protected initialize(editionData: Partial<EditionData>) {
        this.checkForRequiredKeyNames(editionData);
    }

    protected checkForRequiredKeyNames(editionData: Partial<EditionData>) {
        for (const requiredKeyName of Edition.REQUIRED_KEYNAMES) {
            if (editionData[requiredKeyName] === undefined) {
                throw new IncompleteEditionData(editionData, requiredKeyName);
            }
        }
    }
}
