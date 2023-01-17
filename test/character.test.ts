import { Butler } from '~/content/characters/output/butler';
import { Imp } from '~/content/characters/output/imp';
import { Spy } from '~/content/characters/output/spy';
import { Virgin } from '~/content/characters/output/virgin';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Townsfolk } from '~/game/character-type';

describe('test basic functionalities', () => {
    test.concurrent('determine good / evil', () => {
        expect(Washerwoman.isGoodCharacter).toBeTrue();
        expect(Butler.isEvilCharacter).toBeFalse();
        expect(Imp.isGoodCharacter).toBeFalse();
        expect(Spy.isEvilCharacter).toBeTrue();
    });

    test.concurrent('assert character type', () => {
        expect(Washerwoman.isDemon).toBeFalse();
        expect(Washerwoman.isTownsfolk).toBeTrue();

        expect(Butler.isMinion).toBeFalse();
        expect(Butler.isOutsider).toBeTrue();

        expect(Imp.isDemon).toBeTrue();
        expect(Spy.isMinion).toBeTrue();

        Townsfolk.is(Virgin.characterType);
    });
});
