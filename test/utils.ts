import { CharacterLoader } from '~/game/characterloader';
import { Player } from '~/game/player';

const regex = /(.*) is the (.*)/i;

export function playerFromDescription(description: string) {
    const matchResult = description.match(regex);
    if (matchResult === null) {
        throw new Error(`Cannot initialize a player form ${description}`);
    }
    const [_, username, characterName] = matchResult;
    const character = CharacterLoader.load(characterName);
    return new Player(username, character);
}
