import type { CharacterToken } from '~/game/character/character';

import { Generator } from '~/game/collections';
import { GameEnvironment } from '~/game/environment';

export function randomCharacter(): CharacterToken {
    return GameEnvironment.current.characterLoader.randomLoad();
}

export function randomCharacters(
    numCharacters: number
): Iterable<CharacterToken> {
    return Generator.map(
        (_) => randomCharacter(),
        Generator.range(0, numCharacters)
    );
}
