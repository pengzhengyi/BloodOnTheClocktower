import { promises as fs } from 'fs';
import path from 'path';
import { getBackendPath } from '../../../paths';
import { GameParticipantType } from '~/src/backend/game/participants/game-participant-type';

describe('GameParticipantType', () => {
    it('should have enum values all present in the game-participants directory', async () => {
        const gameParticipantTypes = Object.values(GameParticipantType);
        const gameParticipantFileNames = gameParticipantTypes.map(
            (roleType) => roleType.replaceAll(' ', '-') + '.ts'
        );

        // for each folder in the actions directory, check if the folder name is a valid action type
        const gameParticipantsPath = path.join(
            getBackendPath(),
            'game',
            'participants'
        );
        const gameParticipantsDirContent = await fs.readdir(
            gameParticipantsPath
        );

        expect(gameParticipantsDirContent).toIncludeAllMembers(
            gameParticipantFileNames
        );
    });
});
