const { resolve, join } = require('path');

const basepath = resolve(__dirname);
exports.LIBS = join(basepath, 'lib');
exports.APP = join(basepath, 'app');