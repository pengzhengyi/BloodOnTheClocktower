import { type NightActOrdering, NightSheet } from '~/game/night-sheet';
import {
    Mayor,
    Imp,
    Monk,
    Librarian,
    FortuneTeller,
    Washerwoman,
    Investigator,
    Virgin,
    Saint,
    Butler,
    Spy,
    Poisoner,
} from '~/__mocks__/character';

describe('Test basic functionalities', () => {
    test.concurrent('determine will or will not act', async () => {
        const nightSheet = new NightSheet();
        await nightSheet.init([Mayor, Imp, Monk]);
        expect(nightSheet.willActDuringFirstNight(Mayor)).toBeFalse();
        expect(nightSheet.willActDuringOtherNights(Mayor)).toBeFalse();

        expect(nightSheet.willActDuringFirstNight(Imp)).toBeFalse();
        expect(nightSheet.willActDuringOtherNights(Imp)).toBeTrue();

        expect(nightSheet.willActDuringFirstNight(Monk)).toBeFalse();
        expect(nightSheet.willActDuringOtherNights(Monk)).toBeTrue();

        expect(nightSheet.willActDuringFirstNight(Monk)).toBeFalse();
        expect(nightSheet.willActDuringOtherNights(Monk)).toBeTrue();
    });

    test.concurrent('determine night acting order', async () => {
        const characters = [
            Librarian,
            FortuneTeller,
            Washerwoman,
            Monk,
            Investigator,
            Virgin,
            Saint,
            Butler,
            Spy,
            Poisoner,
            Imp,
        ];

        const firstNightOrdering: NightActOrdering =
            await NightSheet.getNightActOrdering(characters, true);
        expect(firstNightOrdering.order).toEqual([
            Poisoner, // 17
            Washerwoman, // 32
            Librarian, // 33
            Investigator, // 34
            FortuneTeller, // 37
            Butler, // 38
            Spy, // 48
        ]);
        expect(firstNightOrdering.notActing).toEqual(
            new Set([Monk, Virgin, Saint, Imp])
        );

        const otherNightsOrdering: NightActOrdering =
            await NightSheet.getNightActOrdering(characters, false);
        expect(otherNightsOrdering.order).toEqual([
            Poisoner, // 8
            Monk, // 13
            Imp, // 24
            FortuneTeller, // 54
            Butler, // 55
            Spy, // 68
        ]);
        expect(otherNightsOrdering.notActing).toEqual(
            new Set([Librarian, Washerwoman, Investigator, Virgin, Saint])
        );
    });
});
