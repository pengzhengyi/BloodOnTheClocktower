import { mock } from 'jest-mock-extended';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import { NightSheet } from '~/game/night-sheet';

export function mockNightSheet(): NightSheet {
    return mock<NightSheet>();
}

export function getTroubleBrewingNightSheet(): Promise<NightSheet> {
    return NightSheet.init(TroubleBrewing.characters);
}
