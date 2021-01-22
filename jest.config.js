process.env.LOG_LEVEL = 'none';

module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '(lib/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js',  'json', 'node'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        warnOnly: false
      }
    }
  }
}
