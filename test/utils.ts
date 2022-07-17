import { Alignment } from '~/game/alignment';
import { CharacterLoader } from '~/game/characterloader';
import { Player } from '~/game/player';

const regex = /(.*) is the\s(evil|good|)\s?(.*)/i;

export function playerFromDescription(description: string) {
    const matchResult = description.match(regex);
    if (matchResult === null) {
        throw new Error(`Cannot initialize a player form ${description}`);
    }
    const [_, username, alignmentDescription, characterName] = matchResult;
    const character = CharacterLoader.load(characterName);
    let alignment: Alignment | undefined;
    if (alignmentDescription === 'evil') {
        alignment = Alignment.Evil;
    } else if (alignmentDescription === 'good') {
        alignment = Alignment.Good;
    }
    return new Player(username, character, alignment);
}
