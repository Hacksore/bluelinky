/* eslint-disable no-console */
import { execSync, spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { getBrandEnvironment } from '../src/constants/europe';
import { Brand } from '../src/interfaces/common.interfaces';

const brands: Brand[] = ['kia', 'hyundai'];

const main = async () => {
  console.debug(`Pulling image hacksore/hks:native`);
  execSync('docker pull hacksore/hks:native');
  const brandCFB = {
    kia: '',
    hyundai: '',
  };
  for (const brand of brands) {
    const { appId } = getBrandEnvironment({ brand });

    const [first] = await new Promise<string[]>((resolve, reject) => {
      console.debug(`Starting image hacksore/hks:native - ${brand}`);
      const process = spawn('docker', [
        'run',
        '--rm',
        'hacksore/hks:native',
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
        console.debug(`Done with hacksore/hks:native - ${brand}`);
        if (code === 0) {
          return resolve(list);
        }
        reject(errors);
      });
    });
    brandCFB[brand] = first;
  }

  const cfbFile = `// Auto generated file on ${new Date().toISOString()}
// run \`npm run eu:export:cfb\` to update it

export const kiaCFB = Buffer.from('${brandCFB.kia}', 'base64');
export const hyundaiCFB = Buffer.from('${brandCFB.hyundai}', 'base64');`;

  writeFileSync(join(__dirname, '..', 'src', 'constants', 'europe.cfb.ts'), cfbFile);
};

main().catch(e => console.error(e));
