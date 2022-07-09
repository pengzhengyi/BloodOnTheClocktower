import { RoleDataKeyName, Script } from './types';
import { CharacterSheet } from './charactersheet';
import { Character } from './character';
import { NoCharacterMatchingId } from './exception';

/**
 * {@link `glossory["Script Tool"]`}
 * The online character list generator, which allows you to design scripts from any combination of character tokens you own. Use the [Script Tool](https://script.bloodontheclocktower.com) at BloodOnTheClocktower.com/script.
 */
export abstract class ScriptTool {
    static load(data: Script): CharacterSheet {
        const characters = data.map((characterId) =>
            this.getCharacterById(characterId[RoleDataKeyName.ID])
        );
        return new CharacterSheet(characters);
    }

    static save(characterSheet: CharacterSheet): Script {
        return characterSheet.characters.map((character) => character.save());
    }

    static getCharacterById(id?: string): typeof Character {
        if (id === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return CharacterSheet.find(id);
    }
}
