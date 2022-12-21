import 'reflect-metadata';
import {
    Expose,
    Exclude,
    Transform,
    Type,
    instanceToPlain,
} from 'class-transformer';
import { CharactersToIDs, CharacterToken } from './character';
import { CharacterLoader } from './characterloader';
import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './charactertype';
import { Generator } from './collections';
import { parsePromiseSettledResults } from './common';
import {
    CharacterLoadFailures,
    CharacterSheetCreationFailure,
    GameError,
    NoCharacterMatchingId,
} from './exception';

/**
 * {@link `glossary["Character sheet"]`}
 * The cardboard sheets that list all of the possible characters and their abilities for the chosen edition.
 */
@Exclude()
export class CharacterSheet {
    static find(id: string) {
        const character = CharacterLoader.tryLoad(id);
        return this._validateFoundCharacter(id, character);
    }

    static async findAsync(id: string) {
        const character = await CharacterLoader.loadAsync(id);
        return this._validateFoundCharacter(id, character);
    }

    static from(characterIds: Iterable<string>): CharacterSheet {
        const characters = Generator.once(characterIds).map((id) =>
            CharacterSheet.find(id)
        );
        return new this(characters);
    }

    static fromTypeToCharacters(
        characterTypeToCharacters: Map<
            typeof CharacterType,
            Array<CharacterToken>
        >
    ) {
        return new this(undefined, characterTypeToCharacters);
    }

    static async fromAsync(
        characterIds: Iterable<string>
    ): Promise<CharacterSheet> {
        const characterPromises = new Generator(characterIds).map(
            (characterId) => this.findAsync(characterId)
        );
        const characterSettledResults = await Promise.allSettled(
            characterPromises
        );
        const characters = parsePromiseSettledResults<
            CharacterToken,
            GameError
        >(characterSettledResults, (errors, values) => {
            throw new CharacterLoadFailures(errors, values);
        });
        return new this(characters);
    }

    protected static _validateFoundCharacter(
        id: string,
        character?: CharacterToken
    ) {
        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return character;
    }

    @Expose({ groups: ['compact'], toPlainOnly: true })
    @Transform(({ value }) => CharactersToIDs(value), { toPlainOnly: true })
    @Type(() => String)
    declare characters: Array<CharacterToken>;

    declare characterTypeToCharacters: Map<
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
        characters?: Iterable<CharacterToken>,
        characterTypes?: Map<typeof CharacterType, Array<CharacterToken>>
    ) {
        if (characters !== undefined) {
            this.initFromCharacters(characters);
        } else if (characterTypes !== undefined) {
            this.initFromTypeToCharacters(characterTypes);
        } else {
            throw new CharacterSheetCreationFailure(characters, characterTypes);
        }

        if (this.characters.length === 0) {
            const innerError = new GameError(
                'No character id is provided when initializing character sheet'
            );
            throw new CharacterSheetCreationFailure(
                characters,
                characterTypes
            ).from(innerError);
        }
    }

    toJSON() {
        return instanceToPlain(this, { groups: ['primary'] });
    }

    getCharactersByType(
        characterType: typeof CharacterType
    ): Array<CharacterToken> {
        return this.characterTypeToCharacters.get(characterType) || [];
    }

    protected initFromCharacters(characters: Iterable<CharacterToken>) {
        if (Array.isArray(characters)) {
            this.characters = characters;
            this.characterTypeToCharacters = Generator.groupBy(
                characters,
                (character) => character.characterType
            );
        } else {
            const generator = Generator.cache(characters);
            this.characterTypeToCharacters = generator.groupBy(
                (character) => character.characterType
            );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.characters = generator.cached!;
        }
    }

    /**
     * {@link `glossary["Not in play"]`}
     * A character that does not exist in the current game, but is on the character sheet.
     */
    getCharactersNotInPlay(
        charactersInPlayer: Iterable<CharacterToken>
    ): Iterable<CharacterToken> {
        return Generator.exclude(this.characters, charactersInPlayer);
    }

    protected initFromTypeToCharacters(
        characterTypeToCharacters: Map<
            typeof CharacterType,
            Array<CharacterToken>
        >
    ) {
        this.characterTypeToCharacters = characterTypeToCharacters;
        this.characters = Array.from(
            Generator.chain_from_iterable(
                this.characterTypeToCharacters.values()
            )
        );
    }
}
