import '@abraham/reflection';
import {
    Expose,
    Exclude,
    Transform,
    Type,
    instanceToPlain,
} from 'class-transformer';
import { Generator } from '../collections';
import { CharacterSheetCreationFailure, GameError } from '../exception';
import { CharactersToIDs, type CharacterToken } from './character';
import {
    type CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character-type';
import { iterableToString } from '~/utils/common';

export interface ICharacterSheet {
    readonly characters: Array<CharacterToken>;

    readonly characterTypeToCharacters: Map<
        typeof CharacterType,
        Array<CharacterToken>
    >;

    readonly minion: Array<CharacterToken>;
    readonly demon: Array<CharacterToken>;
    readonly townsfolk: Array<CharacterToken>;
    readonly outsider: Array<CharacterToken>;
    readonly traveller: Array<CharacterToken>;
    readonly fabled: Array<CharacterToken>;

    toJSON(): Record<string, any>;
    toString(): string;
    getCharactersByType(
        characterType: typeof CharacterType
    ): Array<CharacterToken>;
    getCharactersNotInPlay(
        charactersInPlay: Iterable<CharacterToken>
    ): Iterable<CharacterToken>;
}

/**
 * A small utility class intended to improve `toString` on a set of characters.
 */
class CharacterGroup {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        readonly characters: Array<CharacterToken>,
        readonly groupName?: string
    ) {}

    toString() {
        const groupName = this.groupName ? this.groupName + ':' : '';
        return `${groupName}${this.characters}`;
    }
}

interface AbstractCharacterSheet extends ICharacterSheet {}

abstract class AbstractCharacterSheet {
    toString(): string {
        const characterGroups = [
            new CharacterGroup(this.minion, 'minion'),
            new CharacterGroup(this.demon, 'demon'),
            new CharacterGroup(this.townsfolk, 'townsfolk'),
            new CharacterGroup(this.outsider, 'outsider'),
            new CharacterGroup(this.traveller, 'traveller'),
            new CharacterGroup(this.fabled, 'fabled'),
        ];

        return iterableToString(characterGroups, 'CharacterSheet');
    }
}

/**
 * {@link `glossary["Character sheet"]`}
 * The cardboard sheets that list all of the possible characters and their abilities for the chosen edition.
 */
@Exclude()
export class CharacterSheet
    extends AbstractCharacterSheet
    implements ICharacterSheet
{
    @Expose({ groups: ['compact'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    readonly characters: Array<CharacterToken>;

    readonly characterTypeToCharacters: Map<
        typeof CharacterType,
        Array<CharacterToken>
    >;

    @Expose({ groups: ['primary'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    get minion(): Array<CharacterToken> {
        return this.getCharactersByType(Minion);
    }

    @Expose({ groups: ['primary'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    get demon(): Array<CharacterToken> {
        return this.getCharactersByType(Demon);
    }

    @Expose({ groups: ['primary'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    get townsfolk(): Array<CharacterToken> {
        return this.getCharactersByType(Townsfolk);
    }

    @Expose({ groups: ['primary'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    get outsider(): Array<CharacterToken> {
        return this.getCharactersByType(Outsider);
    }

    @Expose({ groups: ['primary'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    get traveller(): Array<CharacterToken> {
        return this.getCharactersByType(Traveller);
    }

    @Expose({ groups: ['primary'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    get fabled(): Array<CharacterToken> {
        return this.getCharactersByType(Fabled);
    }

    constructor(
        characterTypes: Map<typeof CharacterType, Array<CharacterToken>>
    ) {
        super();

        this.characterTypeToCharacters = characterTypes;
        this.characters = Array.from(
            Generator.chain_from_iterable(
                this.characterTypeToCharacters.values()
            )
        );

        this.validateCharacters();
    }

    toJSON() {
        return instanceToPlain(this, { groups: ['primary'] });
    }

    getCharactersByType(
        characterType: typeof CharacterType
    ): Array<CharacterToken> {
        return this.characterTypeToCharacters.get(characterType) || [];
    }

    /**
     * {@link `glossary["Not in play"]`}
     * A character that does not exist in the current game, but is on the character sheet.
     */
    getCharactersNotInPlay(
        charactersInPlay: Iterable<CharacterToken>
    ): Iterable<CharacterToken> {
        return Generator.exclude(this.characters, charactersInPlay);
    }

    protected validateCharacters() {
        if (this.characters.length === 0) {
            const innerError = new GameError(
                'No character id is provided when initializing character sheet'
            );
            throw new CharacterSheetCreationFailure(
                this.characters,
                this.characterTypeToCharacters
            ).from(innerError);
        }
    }
}
