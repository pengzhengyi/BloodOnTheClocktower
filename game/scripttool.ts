import { RoleDataKeyName, Script } from './types';
import { CharacterSheet } from './charactersheet';
import { Character } from './character';
import { EditionName } from './edition';

export interface ScriptConstraints {
    // filter by edition
    editions: Array<string>;
    // filter by type
    townsfolk: number;
    outsider: number;
    minion: number;
    demon: number;
    traveller: number;
    fabled: Array<string>;
    // ids of character must appear
    includes: Array<string>;
    // ids of character should not appear
    excludes: Array<string>;
}
export abstract class ScriptConstraints {
    static default(): ScriptConstraints {
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

    static new(constraints: Partial<ScriptConstraints>): ScriptConstraints {
        return Object.assign(this.default(), constraints);
    }
}

/**
 * {@link `glossary["Script Tool"]`}
 * The online character list generator, which allows you to design scripts from any combination of character tokens you own. Use the [Script Tool](https://script.bloodontheclocktower.com) at BloodOnTheClocktower.com/script.
 */
export abstract class ScriptTool {
    static getScriptCharacterIds(script: Script) {
        return script.map((scriptCharacter) =>
            Character.nameToId(scriptCharacter[RoleDataKeyName.ID])
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

    // static randomize(constraints: ScriptConstraints): CharacterSheet {
    //      TODO
    // }
}
