const { exec, execSync } = require('child_process');
const path = require('path');
const { APP, LIBS } = require('./bin');

const managedArchs = ['x86_64', 'x86', 'arm64', 'armv7'];

const getArch = () => {
  const arch = execSync('uname -m').toString('utf-8').trim();
  if (!managedArchs.includes(arch)) {
    throw new Error(`Arch '${arch}' not supported`);
  }
  return arch;
}

const ARCH = getArch();

exports.getStamp = async (payload) => {
  return new Promise((resolve, reject) => {
    exec(`LD_LIBRARY_PATH=${path.join(LIBS, ARCH)} java -Djava.library.path=${path.join(LIBS, ARCH)} -jar ${path.join(APP, 'app.jar')} '${payload}'`, (err, stdOut) => {
        if (err) {
            return reject(err);
        }
        resolve(stdOut.trim());
    });
  });
}