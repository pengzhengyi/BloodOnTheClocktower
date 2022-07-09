import { RoleDataKeyName, Script } from './types';
import { CharacterSheet } from './charactersheet';
import { Character } from './character';
import {
    CharacterLoadFailures,
    GameError,
    NoCharacterMatchingId,
} from './exception';
import { Generator } from './collections';
import { parsePromiseSettledResults } from './common';

/**
 * {@link `glossory["Script Tool"]`}
 * The online character list generator, which allows you to design scripts from any combination of character tokens you own. Use the [Script Tool](https://script.bloodontheclocktower.com) at BloodOnTheClocktower.com/script.
 */
export abstract class ScriptTool {
    static async load(data: Script) {
        const characterPromises = new Generator(data).map((characterId) =>
            this.getCharacterById(characterId[RoleDataKeyName.ID])
        );
        const characterSettledResults = await Promise.allSettled(
            characterPromises
        );

        const characters = parsePromiseSettledResults<
            typeof Character,
            GameError
        >(characterSettledResults, (errors, values) => {
            throw new CharacterLoadFailures(errors, values);
        });

        return new CharacterSheet(characters);
    }

    static save(characterSheet: CharacterSheet): Script {
        return characterSheet.characters.map((character) => character.save());
    }

    static async getCharacterById(id?: string) {
        if (id === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return await CharacterSheet.find(id);
    }
}
