import { adaptCharacterTypeToCharacter as fillCharacterTypeToCharacter } from '~/game/common';
import { ModifyByBaron } from '~/game/setup/in-play-characters/modify-by-baron';
import type {
    IInPlayCharactersModification,
    IModifyContext,
} from '~/game/setup/in-play-characters/modify-by-character';
import type { ICharacterTypeToCharacter } from '~/game/types';
import {
    Baron,
    Butler,
    randomCharacterFrom,
    randomCharactersFrom,
    Saint,
} from '~/__mocks__/character';
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/character-sheet';
import { mockStorytellerDecideImplementation } from '~/__mocks__/game-ui';

describe('test modify in-play characters by Baron', () => {
    const characterSheet = getTroubleBrewingCharacterSheet();
    const modifyByBaron = new ModifyByBaron();

    /**
     * {@link `baron["gameplay"][0]`}
     */
    test('The game is being set up for seven players, with five Townsfolk, one Minion, and one Demon. Because the Minion is the Baron, the Storyteller removes two Townsfolk tokens and adds a Saint and a Butler token. In total, three Townsfolk, two Outsider, one Minion, and one Demon tokens go in the bag for the players to draw from.', async () => {
        const initialInPlayCharacters: ICharacterTypeToCharacter = {
            townsfolk: randomCharactersFrom(5, characterSheet.townsfolk),
            outsider: [],
            minion: [Baron],
            demon: [randomCharacterFrom(characterSheet.demon)],
            traveller: [],
            fabled: [],
        };

        mockStorytellerDecideImplementation<
            IModifyContext,
            IInPlayCharactersModification
        >((context) => {
            const inPlayTownsfolks = context.initialInPlayCharacters.townsfolk;
            expect(context.modification.outsider).toBe(2);
            expect(context.modification.townsfolk).toBe(-2);
            const townsfolksToRemove = randomCharactersFrom(
                2,
                inPlayTownsfolks
            );

            const modification: IInPlayCharactersModification = {
                add: fillCharacterTypeToCharacter({
                    outsider: [Saint, Butler],
                }),
                remove: fillCharacterTypeToCharacter({
                    townsfolk: townsfolksToRemove,
                }),
            };

            return Promise.resolve(modification);
        });

        const modifiedInPlayCharacters =
            await modifyByBaron.modifyInitialInPlayCharacters(
                characterSheet,
                initialInPlayCharacters
            );
        expect(modifiedInPlayCharacters.add).toBeDefined();
        expect(modifiedInPlayCharacters.remove).toBeDefined();

        expect(modifiedInPlayCharacters.add?.outsider).toHaveLength(2);
        expect(modifiedInPlayCharacters.add?.outsider).toIncludeSameMembers([
            Saint,
            Butler,
        ]);

        expect(modifiedInPlayCharacters.remove?.townsfolk).toHaveLength(2);
    });
});
