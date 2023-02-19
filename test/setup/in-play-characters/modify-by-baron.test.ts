import { mockStorytellerDecideForModification } from './common';
import { ModifyByBaron } from '~/game/setup/in-play-characters/modify-by-baron';

import type { ICharacterTypeToCharacter } from '~/game/types';
import {
    Baron,
    Butler,
    Drunk,
    FortuneTeller,
    Monk,
    Poisoner,
    randomCharacterFrom,
    randomCharactersFrom,
    Recluse,
    Saint,
    Spy,
} from '~/__mocks__/character';
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/character-sheet';
import { Generator } from '~/game/collections';
import type { ICharacter } from '~/game/character/character';
import type { IInPlayCharactersModification } from '~/game/setup/in-play-characters/modify-by-character';
import { storytellerDecideMock } from '~/__mocks__/game-ui';

function expectAfterBaronModify(
    modifiedInPlayCharacters: IInPlayCharactersModification,
    addedOutsiders?: [ICharacter, ICharacter],
    removedTownsfolks?: [ICharacter, ICharacter]
) {
    expect(modifiedInPlayCharacters.add).toBeDefined();
    expect(modifiedInPlayCharacters.remove).toBeDefined();

    expect(modifiedInPlayCharacters.add?.outsider).toHaveLength(2);

    if (addedOutsiders !== undefined) {
        expect(modifiedInPlayCharacters.add?.outsider).toIncludeSameMembers(
            addedOutsiders
        );
    }

    expect(modifiedInPlayCharacters.remove?.townsfolk).toHaveLength(2);
    if (removedTownsfolks !== undefined) {
        expect(modifiedInPlayCharacters.remove?.townsfolk).toIncludeSameMembers(
            removedTownsfolks
        );
    }
}

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

        mockStorytellerDecideForModification({
            add: {
                outsider: [Saint, Butler],
            },
            remove: {
                townsfolk: -2,
            },
        });

        const modifiedInPlayCharacters =
            await modifyByBaron.modifyInitialInPlayCharacters(
                characterSheet,
                initialInPlayCharacters
            );
        storytellerDecideMock.mockReset();
        expectAfterBaronModify(modifiedInPlayCharacters, [Saint, Butler]);
    });

    /**
     * {@link `baron["gameplay"][1]`}
     */
    test(`The game is being set up for 15 players, with nine Townsfolk, two Outsiders, three Minion, and one Demon tokens. Because the Baron is in play, the Storyteller must add a Drunk and a Recluse. So, they remove the Monk token and add a Recluse token. They then add a the Drunk's "Is the Drunk" reminder token… because this game, one player isn't a Townsfolk—they are an Outsider: the Drunk. All these character tokens then go into the bag for the players to draw from.`, async () => {
        const inPlayTownsfolks = randomCharactersFrom(
            7,
            Generator.exclude(characterSheet.townsfolk, [Monk, FortuneTeller])
        );
        inPlayTownsfolks.push(Monk, FortuneTeller);
        const initialInPlayCharacters: ICharacterTypeToCharacter = {
            townsfolk: inPlayTownsfolks,
            outsider: [Butler, Saint],
            minion: [Baron, Spy, Poisoner],
            demon: [randomCharacterFrom(characterSheet.demon)],
            traveller: [],
            fabled: [],
        };

        const addedOutsiders: [ICharacter, ICharacter] = [Drunk, Recluse];
        const removedTownsfolks: [ICharacter, ICharacter] = [
            Monk,
            FortuneTeller,
        ];
        mockStorytellerDecideForModification({
            add: {
                outsider: addedOutsiders,
            },
            remove: {
                townsfolk: removedTownsfolks,
            },
        });

        const modifiedInPlayCharacters =
            await modifyByBaron.modifyInitialInPlayCharacters(
                characterSheet,
                initialInPlayCharacters
            );

        storytellerDecideMock.mockReset();
        expectAfterBaronModify(
            modifiedInPlayCharacters,
            addedOutsiders,
            removedTownsfolks
        );
    });
});
