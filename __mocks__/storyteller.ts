import { mock } from 'jest-mock-extended';
import { mockGrimoire } from './grimoire';
import type { IStoryTeller } from '~/game/storyteller';
import { StoryTeller } from '~/game/storyteller';

export function mockStoryTeller(): IStoryTeller {
    return mock<IStoryTeller>();
}

export function createBasicStoryTeller(): IStoryTeller {
    const grimoire = mockGrimoire();
    return new StoryTeller(grimoire);
}
