import type { IPlugin } from '../../../common/interfaces/plugin';
import type { IEditionPluginContract } from './contract/edition-plugin-contract';

export interface IEditionPlugin extends IPlugin, IEditionPluginContract {}
