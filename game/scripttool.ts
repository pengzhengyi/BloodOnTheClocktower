import { RoleDataKeyName, Script } from './types';
import { CharacterSheet } from './charactersheet';
import { Character } from './character';

/**
 * {@link `glossory["Script Tool"]`}
 * The online character list generator, which allows you to design scripts from any combination of character tokens you own. Use the [Script Tool](https://script.bloodontheclocktower.com) at BloodOnTheClocktower.com/script.
 */
export abstract class ScriptTool {
    static load(data: Script): CharacterSheet {
        const characters = data.map((characterId) =>
            Character.load(characterId[RoleDataKeyName.ID])
        );
        return new CharacterSheet(characters);
    }

    static save(characterSheet: CharacterSheet): Script {
        return characterSheet.characters.map((character) => character.save());
    }
}
