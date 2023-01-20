import { mock } from 'jest-mock-extended';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import { NightSheet } from '~/game/night-sheet';

export function mockNightSheet(): NightSheet {
    return mock<NightSheet>();
}

let troubleBrewingNightSheet: NightSheet;

export async function getTroubleBrewingNightSheet(): Promise<NightSheet> {
    if (troubleBrewingNightSheet === undefined) {
        const nightSheet = await NightSheet.init(TroubleBrewing.characters);
        troubleBrewingNightSheet = nightSheet;
    }

    return troubleBrewingNightSheet;
}
