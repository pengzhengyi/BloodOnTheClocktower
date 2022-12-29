import roleData from './bonecollector.json';
import { Character } from '~/game/character';

export abstract class BoneCollector extends Character {}

BoneCollector.initialize(roleData);
