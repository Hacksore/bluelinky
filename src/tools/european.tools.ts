import { exec, execSync } from "child_process";
import path from "path";
import { APP, LIBS } from "../bin";

const managedArchs = ['x86_64', 'x86', 'arm64', 'armv7']

const getArch = (): string => {
  const arch = execSync('uname -m').toString('utf-8').trim();
  if (!managedArchs.includes(arch)) {
    throw new Error(`Arch '${arch}' not supported`);
  }
  return arch;
}

const ARCH = getArch();

export const getStamp = async (payload: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(`LD_LIBRARY_PATH=${path.join(LIBS, ARCH)} java -Djava.library.path=${path.join(LIBS, ARCH)} -jar ${path.join(APP, 'app.jar')} '${payload}'`, (err, stdOut) => {
        if (err) {
            return reject(err);
        }
        resolve(stdOut.trim());
    });
  });
}