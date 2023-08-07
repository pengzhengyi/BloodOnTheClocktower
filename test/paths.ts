import path from 'path';

export function getSrcPath(): string {
    return '/workspaces/BloodOnTheClocktower/src';
}

export function getBackendPath(): string {
    return path.join(getSrcPath(), 'backend');
}
