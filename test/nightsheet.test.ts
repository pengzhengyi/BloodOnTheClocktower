import { Butler } from '~/content/characters/output/butler';
import { Fortuneteller } from '~/content/characters/output/fortuneteller';
import { Imp } from '~/content/characters/output/imp';
import { Investigator } from '~/content/characters/output/investigator';
import { Librarian } from '~/content/characters/output/librarian';
import { Mayor } from '~/content/characters/output/mayor';
import { Monk } from '~/content/characters/output/monk';
import { Poisoner } from '~/content/characters/output/poisoner';
import { Saint } from '~/content/characters/output/saint';
import { Spy } from '~/content/characters/output/spy';
import { Virgin } from '~/content/characters/output/virgin';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { NightActOrdering, NightSheet } from '~/game/nightsheet';

describe('Test basic functionalities', () => {
    test.concurrent('determine will or will not act', async () => {
        expect(await NightSheet.willActDuringFirstNight(Mayor)).toBeFalse();
        expect(await NightSheet.willActDuringAllOtherNights(Mayor)).toBeFalse();

        expect(await NightSheet.willActDuringFirstNight(Imp)).toBeFalse();
        expect(await NightSheet.willActDuringAllOtherNights(Imp)).toBeTrue();

        expect(await NightSheet.willActDuringFirstNight(Monk)).toBeFalse();
        expect(await NightSheet.willActDuringAllOtherNights(Monk)).toBeTrue();

        expect(await NightSheet.willActDuringFirstNight(Monk)).toBeFalse();
        expect(await NightSheet.willActDuringAllOtherNights(Monk)).toBeTrue();
    });

    test.concurrent('determine night acting order', async () => {
        const characters = [
            Librarian,
            Fortuneteller,
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
        expect(firstNightOrdering.acting).toEqual([
            Poisoner, // 17
            Washerwoman, // 32
            Librarian, // 33
            Investigator, // 34
            Fortuneteller, // 37
            Butler, // 38
            Spy, // 48
        ]);
        expect(firstNightOrdering.notActing).toEqual(
            new Set([Monk, Virgin, Saint, Imp])
        );

        const otherNightsOrdering: NightActOrdering =
            await NightSheet.getNightActOrdering(characters, false);
        expect(otherNightsOrdering.acting).toEqual([
            Poisoner, // 8
            Monk, // 13
            Imp, // 24
            Fortuneteller, // 54
            Butler, // 55
            Spy, // 68
        ]);
        expect(otherNightsOrdering.notActing).toEqual(
            new Set([Librarian, Washerwoman, Investigator, Virgin, Saint])
        );
    });
});
