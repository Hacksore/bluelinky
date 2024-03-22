import { getBrandEnvironment } from '../src/constants/europe';
import { exportCfb } from './export_cfb';

exportCfb('hacksore/hks:native', 'europe.cfb.ts', getBrandEnvironment).catch(e => console.error(e));
