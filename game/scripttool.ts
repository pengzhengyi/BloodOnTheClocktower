import { RoleDataKeyName, Script } from './types';
import { CharacterSheet } from './charactersheet';
import { Character } from './character';
import { Edition, EditionName } from './edition';
import { Generator } from './collections';
import { EditionLoader } from './editionloader';
import { CharacterLoader } from './characterloader';
import {
    CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './charactertype';
import {
    InvalidScriptConstraints,
    NegativeNumberForCharacterTypeInScriptConstraint,
} from './exception';

export interface NumberOfCharacters {
    townsfolk: number;
    outsider: number;
    minion: number;
    demon: number;
    traveller: number;
}

export interface ScriptConstraints extends NumberOfCharacters {
    // filter by edition
    editions: Array<string>;
    // filter by type
    fabled: Array<string>;
    // ids of character must appear
    includes: Array<string>;
    // ids of character should not appear
    excludes: Array<string>;
}
export class ScriptConstraintsHelper {
    protected _editions?: Generator<typeof Edition>;
    get editions() {
        if (this._editions === undefined) {
            this._editions = Generator.cache(this.constraints.editions).map(
                (editionName) => EditionLoader.load(editionName)
            );
        }
        return this._editions;
    }

    protected _includes?: Generator<typeof Character>;
    get includes() {
        if (this._includes === undefined) {
            this._includes = Generator.cache(this.constraints.includes).map(
                (include) => CharacterLoader.load(include)
            );
        }
        return this._includes;
    }

    protected _excludes?: Generator<typeof Character>;
    get excludes() {
        if (this._excludes === undefined) {
            this._excludes = Generator.cache(this.constraints.excludes).map(
                (exclude) => CharacterLoader.load(exclude)
            );
        }
        return this._excludes;
    }

    protected _excludedCandidateCharacters?: Set<typeof Character>;
    protected get excludedCandidateCharacters() {
        if (this._excludedCandidateCharacters === undefined) {
            this._excludedCandidateCharacters = new Set(
                Generator.chain(this.excludes, this.includes)
            );
        }
        return this._excludedCandidateCharacters;
    }

    protected _townsfolkCandidates?: Generator<typeof Character>;
    protected get townsfolkCandidates() {
        if (this._townsfolkCandidates === undefined) {
            this._townsfolkCandidates =
                this.getCandidatesByCharacterType(Townsfolk);
        }
        return this._townsfolkCandidates;
    }

    protected _outsiderCandidates?: Generator<typeof Character>;
    protected get outsiderCandidates() {
        if (this._outsiderCandidates === undefined) {
            this._outsiderCandidates =
                this.getCandidatesByCharacterType(Outsider);
        }
        return this._outsiderCandidates;
    }

    protected _minionCandidates?: Generator<typeof Character>;
    protected get minionCandidates() {
        if (this._minionCandidates === undefined) {
            this._minionCandidates = this.getCandidatesByCharacterType(Minion);
        }
        return this._minionCandidates;
    }

    protected _demonCandidates?: Generator<typeof Character>;
    protected get demonCandidates() {
        if (this._demonCandidates === undefined) {
            this._demonCandidates = this.getCandidatesByCharacterType(Demon);
        }
        return this._demonCandidates;
    }

    protected _travellerCandidates?: Generator<typeof Character>;
    protected get travellerCandidates() {
        if (this._travellerCandidates === undefined) {
            this._travellerCandidates =
                this.getCandidatesByCharacterType(Traveller);
        }
        return this._travellerCandidates;
    }

    static defaultConstraints(): ScriptConstraints {
        return {
            editions: [
                EditionName.TroubleBrewing,
                EditionName.SectsViolets,
                EditionName.BadMoonRising,
            ],
            townsfolk: 13,
            outsider: 4,
            minion: 4,
            demon: 4,
            traveller: 0,
            fabled: [],
            includes: [],
            excludes: [],
        };
    }

    static default(): ScriptConstraintsHelper {
        return new this(this.defaultConstraints());
    }

    static fromDefaults(constraints: Partial<ScriptConstraints>) {
        return new this(Object.assign(this.defaultConstraints(), constraints));
    }

    static validateNumberOfCharacters(constraints: NumberOfCharacters) {
        if (constraints.townsfolk < 0) {
            throw new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Townsfolk,
                constraints.townsfolk
            );
        }
        if (constraints.outsider < 0) {
            throw new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Outsider,
                constraints.outsider
            );
        }
        if (constraints.minion < 0) {
            throw new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Minion,
                constraints.minion
            );
        }
        if (constraints.demon < 0) {
            throw new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Demon,
                constraints.demon
            );
        }
        if (constraints.traveller < 0) {
            throw new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Traveller,
                constraints.traveller
            );
        }
    }

    static validate(constraints: ScriptConstraints) {
        this.validateNumberOfCharacters(constraints);

        if (!Array.isArray(constraints.editions)) {
            throw new InvalidScriptConstraints(
                constraints,
                new Error('Editions in script constraints should be an array')
            );
        }
        if (!Array.isArray(constraints.fabled)) {
            throw new InvalidScriptConstraints(
                constraints,
                new Error(
                    'Fabled characters in script constraints should be an array'
                )
            );
        }
        if (!Array.isArray(constraints.includes)) {
            throw new InvalidScriptConstraints(
                constraints,
                new Error(
                    'Included characters in script constraints should be an array'
                )
            );
        }
        if (!Array.isArray(constraints.excludes)) {
            throw new InvalidScriptConstraints(
                constraints,
                new Error(
                    'Excluded characters in script constraints should be an array'
                )
            );
        }
    }

    protected characterTypeToIncludedCharacters?: Map<
        typeof CharacterType,
        Array<typeof Character>
    >;

    protected _simplified?: NumberOfCharacters;
    get simplified() {
        if (this._simplified === undefined) {
            const characterTypeToIncludedCharacters =
                (this.characterTypeToIncludedCharacters = Generator.groupBy(
                    this.includes,
                    (character) => character.characterType
                ));
            this._simplified = {
                townsfolk:
                    this.constraints.townsfolk -
                    (characterTypeToIncludedCharacters.get(Townsfolk)?.length ??
                        0),
                outsider:
                    this.constraints.outsider -
                    (characterTypeToIncludedCharacters.get(Outsider)?.length ??
                        0),
                minion:
                    this.constraints.minion -
                    (characterTypeToIncludedCharacters.get(Minion)?.length ??
                        0),
                demon:
                    this.constraints.demon -
                    (characterTypeToIncludedCharacters.get(Demon)?.length ?? 0),
                traveller:
                    this.constraints.traveller -
                    (characterTypeToIncludedCharacters.get(Traveller)?.length ??
                        0),
            };

            try {
                ScriptConstraintsHelper.validateNumberOfCharacters(
                    this._simplified
                );
            } catch (error) {
                throw new InvalidScriptConstraints(
                    this.constraints,
                    error as Error,
                    ' because the number of characters must include has exceeded the specified number of character for some character type'
                );
            }
        }
        return this._simplified;
    }

    protected _candidateCharacterSheets?: Generator<CharacterSheet>;
    get candidateCharacterSheets() {
        if (this._candidateCharacterSheets === undefined) {
            const numberOfCharacters = this.simplified;

            const characterTypeCombinations: Array<
                Iterable<typeof Character[]>
            > = [];

            if (numberOfCharacters.townsfolk > 0) {
                characterTypeCombinations.push(
                    Generator.combinations(
                        numberOfCharacters.townsfolk,
                        this.townsfolkCandidates
                    )
                );
            }

            if (numberOfCharacters.outsider > 0) {
                characterTypeCombinations.push(
                    Generator.combinations(
                        numberOfCharacters.outsider,
                        this.outsiderCandidates
                    )
                );
            }

            if (numberOfCharacters.minion > 0) {
                characterTypeCombinations.push(
                    Generator.combinations(
                        numberOfCharacters.minion,
                        this.minionCandidates
                    )
                );
            }

            if (numberOfCharacters.demon > 0) {
                characterTypeCombinations.push(
                    Generator.combinations(
                        numberOfCharacters.demon,
                        this.demonCandidates
                    )
                );
            }

            if (numberOfCharacters.traveller > 0) {
                characterTypeCombinations.push(
                    Generator.combinations(
                        numberOfCharacters.traveller,
                        this.travellerCandidates
                    )
                );
            }

            const characterCombinations = Generator.product(
                characterTypeCombinations
            );

            this._candidateCharacterSheets = Generator.once(
                characterCombinations
            ).map((charactersForCharacterType) => {
                const characters = Generator.chain_from_iterable<
                    typeof Character
                >(charactersForCharacterType);

                if (this.hasIncludes) {
                    return new CharacterSheet(
                        Generator.chain(characters, this.includes)
                    );
                } else {
                    return new CharacterSheet(characters);
                }
            });
        }

        return this._candidateCharacterSheets;
    }

    get hasIncludes() {
        return this.constraints.includes.length > 0;
    }

    get hasExcludes() {
        return this.constraints.excludes.length > 0;
    }

    constructor(readonly constraints: ScriptConstraints) {
        this.constraints = constraints;

        ScriptConstraintsHelper.validate(constraints);
    }

    getCandidatesByCharacterType(
        characterType: typeof CharacterType
    ): Generator<typeof Character> {
        const candidates = Generator.cache(
            Generator.chain_from_iterable(
                Generator.map(
                    (edition) => edition.getCharactersByType(characterType),
                    this.editions
                )
            )
        );

        if (this.hasExcludes) {
            candidates.exclude(this.excludedCandidateCharacters);
        }

        return candidates;
    }
}

/**
 * {@link `glossary["Script Tool"]`}
 * The online character list generator, which allows you to design scripts from any combination of character tokens you own. Use the [Script Tool](https://script.bloodontheclocktower.com) at BloodOnTheClocktower.com/script.
 */
export abstract class ScriptTool {
    static getScriptCharacterIds(script: Script) {
        return script.map((scriptCharacter) =>
            Character.getCanonicalId(scriptCharacter[RoleDataKeyName.ID])
        );
    }

    static load(script: Script) {
        return CharacterSheet.from(this.getScriptCharacterIds(script));
    }

    static async loadAsync(script: Script) {
        return await CharacterSheet.fromAsync(
            this.getScriptCharacterIds(script)
        );
    }

    static candidates(
        constraints: Partial<ScriptConstraints>,
        numCandidateUpperbound = 1
    ): Iterable<CharacterSheet> {
        const solver = ScriptConstraintsHelper.fromDefaults(constraints);
        return solver.candidateCharacterSheets.limit(numCandidateUpperbound);
    }
}
