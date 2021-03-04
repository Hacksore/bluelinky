const { execSync, spawn } = require('child_process');

const APP_IDS = {
  hyundai: '99cfff84-f4e2-4be8-a5ed-e5b755eb6581',
  kia: '693a33fa-c117-43f2-ae3b-61a02d24f417'
};

exports.getStamps = async (brand) => {
  if (!APP_IDS[brand]) {
    throw new Error(`${brand} is not managed.`);
  }

  return new Promise((resolve, reject) => {
    execSync('docker pull hacksore/hks');
    const process = spawn('docker', ['run', 'hacksore/hks', brand, 'list', APP_IDS[brand]]);
    const list = [];
    let errors = '';
    process.stdout.on('data', (data) => {
      const chunk = data.toString().split('\n').map(s => s.trim()).filter(s => s != '');
      list.push(...chunk);
    });
    process.stderr.on('data', (data) => {
      errors += data + '\n';
    });
    process.on('close', (code) => {
      if(code === 0) {
        return resolve(list);
      }
      reject(errors);
    });
  });
};
