import { Townsfolk } from '~/game/character/character-type';
import { Washerwoman, Butler, Imp, Spy, Virgin } from '~/__mocks__/character';

describe('test basic functionalities', () => {
    test.concurrent('determine good / evil', () => {
        expect(Washerwoman.isGood).toBeTrue();
        expect(Butler.isEvil).toBeFalse();
        expect(Imp.isGood).toBeFalse();
        expect(Spy.isEvil).toBeTrue();
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
