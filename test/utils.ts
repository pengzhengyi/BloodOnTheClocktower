import { Alignment } from '~/game/alignment';
import { CharacterLoader } from '~/game/character/character-loader';
import { Player } from '~/game/player';

const regex = /(.*) is\s?(?:the|a|an)?\s(evil|good|)\s?(.*)/i;

export async function playerFromDescription(description: string) {
    const matchResult = description.match(regex);
    if (matchResult === null) {
        throw new Error(`Cannot initialize a player form ${description}`);
    }
    const [_, username, alignmentDescription, characterName] = matchResult;
    const character = await CharacterLoader.loadAsync(characterName);

    let alignment: Alignment | undefined;
    if (alignmentDescription === 'evil') {
        alignment = Alignment.Evil;
    } else if (alignmentDescription === 'good') {
        alignment = Alignment.Good;
    }

    return await Player.init(username, character, alignment);
}
