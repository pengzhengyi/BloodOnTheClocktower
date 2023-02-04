import {
    BecomeDemonCategory,
    type ICharacterTypeChangeCategory,
    LoseDemonCategory,
} from '../event-category/character-type-change';
import type { INotification } from '../types';
import { AbstractNotification } from './common';
import { NightSheet } from '~/game/night-sheet';

const CATEGORY_CLASSES = [BecomeDemonCategory, LoseDemonCategory];

export interface ICharacterTypeChangeNotification
    extends INotification<ICharacterTypeChangeCategory> {}

/**
 * A notification system based on character type change. Character type change is categorized based on the previous character type and new character type.
 *
 * For example, when new character type is Demon, it is one of `BecomeDemon` change.
 */
export class CharacterTypeChangeNotification
    extends AbstractNotification
    implements ICharacterTypeChangeNotification
{
    static REGISTERED_EVENT_CATEGORIES = CATEGORY_CLASSES.map((CategoryClass) =>
        CategoryClass.getInstance()
    );

    defaultPriorityWhenNotProvided: number =
        NightSheet.DEFAULT_NOT_ACTING_PRIORITY + 1;

    get eventCategories() {
        return CharacterTypeChangeNotification.REGISTERED_EVENT_CATEGORIES;
    }
}
