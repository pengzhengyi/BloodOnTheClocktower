import type { CharacterToken } from '~/game/character';
import { CharacterLoader } from '~/game/character-loader';
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
