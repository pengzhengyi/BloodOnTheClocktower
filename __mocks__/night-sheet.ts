import { mock } from 'jest-mock-extended';
import { getTroubleBrewingCharacterSheet } from './character-sheet';
import type { INightSheet } from '~/game/night-sheet';
import { NightSheet } from '~/game/night-sheet';

export function mockNightSheet(): INightSheet {
    return mock<INightSheet>();
}

let troubleBrewingNightSheet: INightSheet;

export async function getTroubleBrewingNightSheet(): Promise<INightSheet> {
    if (troubleBrewingNightSheet === undefined) {
        const troubleBrewing = getTroubleBrewingCharacterSheet();
        const nightSheet = new NightSheet();
        await nightSheet.init(troubleBrewing.characters);
        troubleBrewingNightSheet = nightSheet;
    }

    return troubleBrewingNightSheet;
}
