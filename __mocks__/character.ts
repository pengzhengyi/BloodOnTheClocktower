import type { CharacterToken } from '~/game/character/character';
import { CharacterLoader } from '~/game/character/character-loader';
import { Generator } from '~/game/collections';

export function randomCharacter(): CharacterToken {
    return CharacterLoader.randomLoad();
}

export function randomCharacters(
    numCharacters: number
): Iterable<CharacterToken> {
    return Generator.map(
        (_) => randomCharacter(),
        Generator.range(0, numCharacters)
    );
}
