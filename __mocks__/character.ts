import type { CharacterToken } from '~/game/character/character';
import { CharacterIds } from '~/game/character/character-id';

import { Generator } from '~/game/collections';
import { GameEnvironment } from '~/game/environment';

export function randomCharacter(): CharacterToken {
    return GameEnvironment.current.characterLoader.randomLoad();
}

export function getCharacter(characterId: string): CharacterToken {
    return GameEnvironment.current.characterLoader.load(characterId);
}

export function randomCharacters(
    numCharacters: number
): Iterable<CharacterToken> {
    return Generator.map(
        (_) => randomCharacter(),
        Generator.range(0, numCharacters)
    );
}

export const ScarletWoman = getCharacter(CharacterIds.ScarletWoman);
export const Virgin = getCharacter(CharacterIds.Virgin);
export const Judge = getCharacter(CharacterIds.Judge);
export const Mathematician = getCharacter(CharacterIds.Mathematician);
export const Washerwoman = getCharacter(CharacterIds.Washerwoman);
export const Butler = getCharacter(CharacterIds.Butler);
export const FortuneTeller = getCharacter(CharacterIds.FortuneTeller);
export const Imp = getCharacter(CharacterIds.Imp);
export const Investigator = getCharacter(CharacterIds.Investigator);
export const Librarian = getCharacter(CharacterIds.Librarian);
export const Mayor = getCharacter(CharacterIds.Mayor);
export const Monk = getCharacter(CharacterIds.Monk);
export const Poisoner = getCharacter(CharacterIds.Poisoner);
export const Saint = getCharacter(CharacterIds.Saint);
export const Spy = getCharacter(CharacterIds.Spy);
export const Drunk = getCharacter(CharacterIds.Drunk);
export const Baron = getCharacter(CharacterIds.Baron);
export const Empath = getCharacter(CharacterIds.Empath);
export const Soldier = getCharacter(CharacterIds.Soldier);
export const Undertaker = getCharacter(CharacterIds.Undertaker);
export const Ravenkeeper = getCharacter(CharacterIds.Ravenkeeper);
export const Chef = getCharacter(CharacterIds.Chef);
export const FangGu = getCharacter(CharacterIds.FangGu);
export const Scapegoat = getCharacter(CharacterIds.Scapegoat);
export const Slayer = getCharacter(CharacterIds.Slayer);
export const Recluse = getCharacter(CharacterIds.Recluse);

export const ALL_CHARACTERS = [
    ScarletWoman,
    Virgin,
    Judge,
    Mathematician,
    Washerwoman,
    Butler,
    FortuneTeller,
    Imp,
    Investigator,
    Librarian,
    Mayor,
    Monk,
    Poisoner,
    Saint,
    Spy,
    Drunk,
    Baron,
    Empath,
    Soldier,
    Undertaker,
    Ravenkeeper,
    Chef,
    FangGu,
    Scapegoat,
    Slayer,
    Recluse,
];
