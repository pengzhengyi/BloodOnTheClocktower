import { mock } from 'jest-mock-extended';
import { getTroubleBrewingCharacterSheet } from './character-sheet';
import { NightSheet } from '~/game/night-sheet';

export function mockNightSheet(): NightSheet {
    return mock<NightSheet>();
}

let troubleBrewingNightSheet: NightSheet;

export async function getTroubleBrewingNightSheet(): Promise<NightSheet> {
    if (troubleBrewingNightSheet === undefined) {
        const troubleBrewing = getTroubleBrewingCharacterSheet();
        const nightSheet = await NightSheet.init(troubleBrewing.characters);
        troubleBrewingNightSheet = nightSheet;
    }

    return troubleBrewingNightSheet;
}
