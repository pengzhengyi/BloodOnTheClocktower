import { CharacterIds } from '~/game/character/character-id';
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
        expect(
            nightSheet.willActDuringFirstNight(CharacterIds.Mayor)
        ).toBeFalse();
        expect(
            nightSheet.willActDuringOtherNights(CharacterIds.Mayor)
        ).toBeFalse();

        expect(
            nightSheet.willActDuringFirstNight(CharacterIds.Imp)
        ).toBeFalse();
        expect(
            nightSheet.willActDuringOtherNights(CharacterIds.Imp)
        ).toBeTrue();

        expect(
            nightSheet.willActDuringFirstNight(CharacterIds.Monk)
        ).toBeFalse();
        expect(
            nightSheet.willActDuringOtherNights(CharacterIds.Monk)
        ).toBeTrue();

        expect(
            nightSheet.willActDuringFirstNight(CharacterIds.Monk)
        ).toBeFalse();
        expect(
            nightSheet.willActDuringOtherNights(CharacterIds.Monk)
        ).toBeTrue();
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
            Poisoner.id, // 17
            Washerwoman.id, // 32
            Librarian.id, // 33
            Investigator.id, // 34
            FortuneTeller.id, // 37
            Butler.id, // 38
            Spy.id, // 48
        ]);
        expect(firstNightOrdering.notActing).toEqual(
            new Set([Monk.id, Virgin.id, Saint.id, Imp.id])
        );

        const otherNightsOrdering: NightActOrdering =
            await NightSheet.getNightActOrdering(characters, false);
        expect(otherNightsOrdering.order).toEqual([
            Poisoner.id, // 8
            Monk.id, // 13
            Imp.id, // 24
            FortuneTeller.id, // 54
            Butler.id, // 55
            Spy.id, // 68
        ]);
        expect(otherNightsOrdering.notActing).toEqual(
            new Set([
                Librarian.id,
                Washerwoman.id,
                Investigator.id,
                Virgin.id,
                Saint.id,
            ])
        );
    });
});
