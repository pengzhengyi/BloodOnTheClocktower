import { RoleDataKeyName, Script } from './types';
import { CharacterSheet } from './charactersheet';
import { Character } from './character';

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

    static save(characterSheet: CharacterSheet): Script {
        return characterSheet.characters.map((character) =>
            character.toObject()
        );
    }
}
