import {
    DawnPhaseCategory,
    DayPhaseCategory,
    DuskPhaseCategory,
    GameEndPhaseCategory,
    IGamePhaseCategory,
    NightPhaseCategory,
    SetupPhaseCategory,
} from '../event-category/game-phase';
import type { IGamePhaseEvent } from '../event/game-phase';
import type { IEvent } from '../types';
import { AbstractNotification } from './common';
import type { Phase } from '~/game/phase';
import { NightSheet } from '~/game/night-sheet';
import { Generator } from '~/game/collections';

const CATEGORY_CLASSES = [
    SetupPhaseCategory,
    NightPhaseCategory,
    DawnPhaseCategory,
    DayPhaseCategory,
    DuskPhaseCategory,
    GameEndPhaseCategory,
];

type TCategoryClass = typeof CATEGORY_CLASSES[number];
type TCategoryPhase = TCategoryClass['phase'];

/**
 * A notification system based on game phase. Game phase is categorized based on phase.
 *
 * For example, second day and fourth day have the same event category while second day and first night does not have.
 */
export class GamePhaseNotification extends AbstractNotification {
    defaultPriorityWhenNotProvided: number =
        NightSheet.DEFAULT_NOT_ACTING_PRIORITY + 1;

    protected static phaseToCategory: Map<Phase, IGamePhaseCategory> = new Map(
        Generator.map(
            ([category, phase]) => [phase, category],
            Generator.map(
                (Category: TCategoryClass) =>
                    [new Category(), Category.phase] as [
                        IGamePhaseCategory,
                        TCategoryPhase
                    ],
                CATEGORY_CLASSES
            )
        )
    );

    static getEventCategory(phase: TCategoryPhase): IGamePhaseCategory;

    // eslint-disable-next-line no-dupe-class-members
    static getEventCategory(phase: Phase): IGamePhaseCategory | undefined {
        return this.phaseToCategory.get(phase);
    }

    protected getEventCategories(event: IEvent): Iterable<IGamePhaseCategory> {
        if ('gamePhase' in event) {
            const category = this.getGamePhaseEventCategory(
                event as IGamePhaseEvent
            );

            if (category !== undefined) {
                return [category];
            }
        }

        return [];
    }

    protected getGamePhaseEventCategory(
        event: IGamePhaseEvent
    ): IGamePhaseCategory | undefined {
        return GamePhaseNotification.phaseToCategory.get(event.gamePhase.phase);
    }
}
