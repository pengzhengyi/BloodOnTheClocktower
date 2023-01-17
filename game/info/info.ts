import { GAME_UI } from '../dependencies.config';
import type { Player } from '../player';
import type {
    TrueInformationOptions,
    FalseInformationOptions,
} from './information';
import type { StoryTellerInformationOptions } from './storytellerinformation';

/**
 * There are two classifications for info:
 *
 * - Subjective: good info and bad info where good info is helpful to its receiver while bad info misleading
 * - Objective: true info and false info depending on whether the ability malfunctions
 *
 * {@link `glossary["True info"]`}
 * True information, such as a true statement, gesture, or character token. The Storyteller must always give true information about the rules. See False info.
 *
 * {@link `glossary["False info"]`}
 * False information, such as a false statement, gesture, or character token. The Storyteller may give false information when an ability malfunctions, such as when the player is drunk or poisoned. See True info.
 *
 * However, there are some cases where these classifications becomes a little unintuitive.
 *
 *  @example {@link `spy["gameplay"][0]`}
 * The Washerwoman learns that either Abdallah or Douglas is the Ravenkeeper. Abdallah is the Monk, and Douglas is the Spy registering as the Ravenkeeper.
 *
 * In this example, Washerwoman's ability does not malfunction, so the washerwoman player gets true but misleading info.
 *
 * There is yet one other special genre of information: storyteller information. It is both true and good info as it is the actual information. For example, spy can see the Grimoire, so it has access to storyteller information.
 */
export abstract class Info<T> {
    readonly info: T;

    constructor(info: T) {
        this.info = info;
    }

    send(player: Player, reason?: string): Promise<void> {
        return GAME_UI.send(player, this, reason);
    }
}

export type InfoOptions<T> =
    | TrueInformationOptions<T>
    | FalseInformationOptions<T>
    | StoryTellerInformationOptions<T>;
