import { resolve, join } from "path";

const basepath = resolve(__dirname);
export const LIBS = join(basepath, 'lib');
export const APP = join(basepath, 'app');