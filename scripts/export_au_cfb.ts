import { getBrandEnvironment } from '../src/constants/australia';
import { exportCfb } from './export_cfb';

exportCfb('hacksore/hks:native-au', 'australia.cfb.ts', getBrandEnvironment).catch(e =>
  console.error(e)
);
