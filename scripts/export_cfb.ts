/* eslint-disable no-console */
import { execSync, spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AustraliaBrandEnvironment } from '../src/constants/australia';
import { EuropeanBrandEnvironment } from '../src/constants/europe';
import { Brand } from '../src/interfaces/common.interfaces';

const brands: Brand[] = ['kia', 'hyundai'];

export const exportCfb = async (
  dockerImage: string,
  outputFilename: string,
  getBrandEnvironment: (config: {
    brand: Brand;
  }) => EuropeanBrandEnvironment | AustraliaBrandEnvironment
) => {
  console.debug(`Pulling image ${dockerImage}`);
  execSync(`docker pull ${dockerImage}`);
  const brandCFB = {
    kia: '',
    hyundai: '',
  };
  for (const brand of brands) {
    try {
      const { appId } = getBrandEnvironment({ brand });

      const [first] = await new Promise<string[]>((resolve, reject) => {
        console.debug(`Starting image ${dockerImage} - ${brand}`);
        const process = spawn('docker', [
          'run',
          '--rm',
          dockerImage,
          brand,
          'dumpCFB',
          `${appId}:${Date.now()}`,
        ]);
        const list: Array<string> = [];
        let errors = '';

        process.stdout.on('data', data => {
          const chunk: Array<string> = data
            .toString()
            .split('\n')
            .map(s => s.trim())
            .filter(s => s != '');
          list.push(...chunk);
        });

        process.stderr.on('data', data => {
          errors += data + '\n';
        });

        process.on('close', code => {
          console.debug(`Done with ${dockerImage} - ${brand}`);
          if (code === 0) {
            return resolve(list);
          }
          reject(errors);
        });
      });
      brandCFB[brand] = first;
    } catch (e) {
      // Skip any unsupported brands in regions
      continue;
    }
  }

  const cfbFile = `// Auto generated file on ${new Date().toISOString()}
// run \`npm run eu:export:cfb\` or \`npm run au:export:cfb\` respectively to update it

export const kiaCFB = Buffer.from('${brandCFB.kia}', 'base64');
export const hyundaiCFB = Buffer.from('${brandCFB.hyundai}', 'base64');`;

  writeFileSync(join(__dirname, '..', 'src', 'constants', outputFilename), cfbFile);
};
