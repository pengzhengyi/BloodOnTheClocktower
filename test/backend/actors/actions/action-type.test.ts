import { promises as fs } from 'fs';
import path from 'path';
import { getBackendPath } from '../../../paths';
import { ActionType } from '~/src/backend/actors/actions/action-type';

describe('ActionType', () => {
    it('should have enum values equivalent to all folders in the actions directory', async () => {
        const actionTypes: Set<string> = new Set(Object.values(ActionType));

        // for each folder in the actions directory, check if the folder name is a valid action type
        const actionsPath = path.join(getBackendPath(), 'actors', 'actions');
        const actionsDirContent = await fs.readdir(actionsPath);
        await Promise.all(
            actionsDirContent.map((item) =>
                fs.lstat(path.join(actionsPath, item)).then((stat) => {
                    if (stat.isDirectory()) {
                        const actionType = item.replaceAll('-', ' ');

                        expect(actionTypes.delete(actionType)).toBe(true);
                    }
                })
            )
        );

        expect(actionTypes.size).toBe(0);
    });
});
