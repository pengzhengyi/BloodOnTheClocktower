import {
    type EditionData,
    EditionKeyName,
    RoleDataKeyName,
    type Script,
} from './types';
import type { ICharacterSheet } from './character/character-sheet';
import { Character, type CharacterToken } from './character/character';
import type { IEdition } from './edition/edition';
import { Generator } from './collections';
import {
    type CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character/character-type';
import { NegativeNumberForCharacterTypeInScriptConstraint } from './exception/negative-number-for-character-type-in-script-constraint';
import { GameEnvironment } from './environment';
import { CharacterSheetFactory } from './character/character-sheet-factory';
import { InvalidScriptConstraints } from './exception/invalid-script-constraints';
import { TooManyMustIncludedCharacters } from './exception/too-many-must-included-characters';
import { EditionIds } from './edition/edition-id';

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
    static defaultConstraints(): ScriptConstraints {
        return {
            editions: [
                EditionIds.TroubleBrewing,
                EditionIds.SectsViolets,
                EditionIds.BadMoonRising,
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

    static async fromDefaults(constraints: Partial<ScriptConstraints>) {
        const correctedConstraints = Object.assign(
            this.defaultConstraints(),
            constraints
        );
        return await ScriptConstraintsHelper.init(correctedConstraints);
    }

    static async init(constraints: ScriptConstraints) {
        const helper = new this(constraints);
        await helper.validate();
        return helper;
    }

    static async validateNumberOfCharacters(constraints: NumberOfCharacters) {
        await Promise.all([
            new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Townsfolk,
                constraints.townsfolk
            ).throwWhen((error) => error.constraints.townsfolk < 0),
            new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Outsider,
                constraints.outsider
            ).throwWhen((error) => error.constraints.outsider < 0),
            new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Minion,
                constraints.minion
            ).throwWhen((error) => error.constraints.minion < 0),
            new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Demon,
                constraints.demon
            ).throwWhen((error) => error.constraints.demon < 0),
            new NegativeNumberForCharacterTypeInScriptConstraint(
                constraints,
                Traveller,
                constraints.traveller
            ).throwWhen((error) => error.constraints.traveller < 0),
        ]);
    }

    protected declare editions: Array<IEdition>;

    protected declare fabled: Array<CharacterToken>;

    protected declare excludes: Array<CharacterToken>;

    protected declare includes: Array<CharacterToken>;

    protected declare characterTypeToIncludedCharacters: Map<
        typeof CharacterType,
        Array<CharacterToken>
    >;

    protected declare simplified: NumberOfCharacters;

    protected _excludedCandidateCharacters?: Set<CharacterToken>;
    protected get excludedCandidateCharacters() {
        if (this._excludedCandidateCharacters === undefined) {
            this._excludedCandidateCharacters = new Set(
                Generator.chain(this.excludes, this.includes)
            );
        }
        return this._excludedCandidateCharacters;
    }

    protected _townsfolkCandidates?: Generator<CharacterToken>;
    protected get townsfolkCandidates() {
        if (this._townsfolkCandidates === undefined) {
            this._townsfolkCandidates =
                this.getCandidatesByCharacterType(Townsfolk);
        }
        return this._townsfolkCandidates;
    }

    protected _outsiderCandidates?: Generator<CharacterToken>;
    protected get outsiderCandidates() {
        if (this._outsiderCandidates === undefined) {
            this._outsiderCandidates =
                this.getCandidatesByCharacterType(Outsider);
        }
        return this._outsiderCandidates;
    }

    protected _minionCandidates?: Generator<CharacterToken>;
    protected get minionCandidates() {
        if (this._minionCandidates === undefined) {
            this._minionCandidates = this.getCandidatesByCharacterType(Minion);
        }
        return this._minionCandidates;
    }

    protected _demonCandidates?: Generator<CharacterToken>;
    protected get demonCandidates() {
        if (this._demonCandidates === undefined) {
            this._demonCandidates = this.getCandidatesByCharacterType(Demon);
        }
        return this._demonCandidates;
    }

    protected _travellerCandidates?: Generator<CharacterToken>;
    protected get travellerCandidates() {
        if (this._travellerCandidates === undefined) {
            this._travellerCandidates =
                this.getCandidatesByCharacterType(Traveller);
        }
        return this._travellerCandidates;
    }

    protected _candidateCharacterSheets?: Generator<ICharacterSheet>;
    get candidateCharacterSheets() {
        if (this._candidateCharacterSheets === undefined) {
            const numberOfCharacters = this.simplified;

            const characterTypeCombinations: Array<Iterable<CharacterToken[]>> =
                [];

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
                const characters =
                    Generator.chain_from_iterable<CharacterToken>(
                        charactersForCharacterType
                    );

                if (this.hasIncludes) {
                    return CharacterSheetFactory.getInstance().getFromCharacters(
                        Generator.chain(characters, this.includes, this.fabled)
                    );
                } else {
                    return CharacterSheetFactory.getInstance().getFromCharacters(
                        characters
                    );
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

    protected constructor(readonly constraints: ScriptConstraints) {
        this.constraints = constraints;
    }

    protected async validate() {
        await Promise.all([
            ScriptConstraintsHelper.validateNumberOfCharacters(
                this.constraints
            ),
            this.validateEditions(this.constraints),
            this.validateFabled(this.constraints),
            this.validateExcludes(this.constraints),
            this.validateIncludes(this.constraints),
        ]);
    }

    protected async validateEditions(constraints: ScriptConstraints) {
        new InvalidScriptConstraints(
            constraints,
            new Error('Editions in script constraints should be an array')
        ).throwWhen((error) => !Array.isArray(error.constraints.editions));

        this.editions = await Promise.all(
            constraints.editions.map((edition) =>
                GameEnvironment.current.loadEditionAsync(edition)
            )
        );
    }

    protected async validateFabled(constraints: ScriptConstraints) {
        new InvalidScriptConstraints(
            constraints,
            new Error(
                'Fabled characters in script constraints should be an array'
            )
        ).throwWhen((error) => !Array.isArray(error.constraints.fabled));

        for (const character of constraints.fabled) {
            await GameEnvironment.current.loadCharacterAsync(character);
        }
        this.fabled = await Promise.all(
            constraints.fabled.map((character) =>
                GameEnvironment.current.loadCharacterAsync(character)
            )
        );
    }

    protected async validateExcludes(constraints: ScriptConstraints) {
        new InvalidScriptConstraints(
            constraints,
            new Error(
                'Excluded characters in script constraints should be an array'
            )
        ).throwWhen((error) => !Array.isArray(error.constraints.excludes));

        this.excludes = await Promise.all(
            constraints.excludes.map((character) =>
                GameEnvironment.current.loadCharacterAsync(character)
            )
        );
    }

    protected async validateIncludes(constraints: ScriptConstraints) {
        new InvalidScriptConstraints(
            constraints,
            new Error(
                'Included characters in script constraints should be an array'
            )
        ).throwWhen((error) => !Array.isArray(error.constraints.includes));

        await new TooManyMustIncludedCharacters(this).validateOrThrow();
        this.includes = await Promise.all(
            constraints.includes.map((character) =>
                GameEnvironment.current.loadCharacterAsync(character)
            )
        );
    }

    simplify() {
        this.characterTypeToIncludedCharacters = Generator.groupBy(
            Generator.map(
                (include) => GameEnvironment.current.loadCharacter(include),
                this.constraints.includes
            ),
            (character) => character.characterType
        );

        return (this.simplified = {
            townsfolk:
                this.constraints.townsfolk -
                (this.characterTypeToIncludedCharacters.get(Townsfolk)
                    ?.length ?? 0),
            outsider:
                this.constraints.outsider -
                (this.characterTypeToIncludedCharacters.get(Outsider)?.length ??
                    0),
            minion:
                this.constraints.minion -
                (this.characterTypeToIncludedCharacters.get(Minion)?.length ??
                    0),
            demon:
                this.constraints.demon -
                (this.characterTypeToIncludedCharacters.get(Demon)?.length ??
                    0),
            traveller:
                this.constraints.traveller -
                (this.characterTypeToIncludedCharacters.get(Traveller)
                    ?.length ?? 0),
        });
    }

    getCandidatesByCharacterType(
        characterType: typeof CharacterType
    ): Generator<CharacterToken> {
        const candidates = Generator.cache(
            Generator.chain_from_iterable(
                Generator.map((edition) => {
                    const characterSheet =
                        CharacterSheetFactory.getInstance().getFromEdition(
                            edition
                        );
                    return characterSheet.getCharactersByType(characterType);
                }, this.editions)
            )
        );

        if (this.hasExcludes || this.hasIncludes) {
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

    static load(script: Script): ICharacterSheet {
        return CharacterSheetFactory.getInstance().getFromCharacterIds(
            this.getScriptCharacterIds(script)
        );
    }

    static async loadAsync(script: Script): Promise<ICharacterSheet> {
        return await CharacterSheetFactory.getInstance().getFromCharacterIdsAsync(
            this.getScriptCharacterIds(script)
        );
    }

    static async candidates(
        constraints: Partial<ScriptConstraints>,
        numCandidateUpperbound = 1
    ): Promise<Iterable<ICharacterSheet>> {
        const solver = await ScriptConstraintsHelper.fromDefaults(constraints);
        return solver.candidateCharacterSheets.limit(numCandidateUpperbound);
    }

    static createCustomEdition(
        characterSheet: ICharacterSheet,
        otherEditionData: Partial<Omit<EditionData, EditionKeyName.CHARACTERS>>
    ): IEdition {
        const characterEditionData: Pick<
            EditionData,
            EditionKeyName.CHARACTERS
        > = { [EditionKeyName.CHARACTERS]: characterSheet.toJSON() };
        const editionData: Partial<EditionData> = Object.assign(
            {},
            otherEditionData,
            characterEditionData
        );
        return GameEnvironment.current.loadCustomEdition(editionData);
    }
}
