import { HTTPError, ParseError } from 'got';
export class ManagedBluelinkyError extends Error {
  static ErrorName = 'ManagedBluelinkyError';
  constructor(message: string, public readonly source?: Error) {
    super(message);
    this.name = ManagedBluelinkyError.ErrorName;
  }
}

export const manageBluelinkyError = (
  err: unknown,
  context?: string
): unknown | Error | ManagedBluelinkyError => {
  if (err instanceof HTTPError) {
    return new ManagedBluelinkyError(
      `${context ? `@${context}: ` : ''}[${err.statusCode}] ${err.statusMessage} on [${
        err.method
      }] ${err.url} - ${JSON.stringify(err.body)}`,
      err
    );
  }
  if (err instanceof ParseError) {
    return new ManagedBluelinkyError(
      `${context ? `@${context}: ` : ''} Parsing error on [${err.method}] ${
        err.url
      } - ${JSON.stringify(err.response?.body)}`,
      err
    );
  }
  if (err instanceof Error) {
    return err;
  }
  return err;
};

export const asyncMap = async <T, U>(
  array: T[],
  callback: (item: T, i: number, items: T[]) => Promise<U>
): Promise<U[]> => {
  const mapped: U[] = [];
  for (let index = 0; index < array.length; index++) {
    mapped.push(await callback(array[index], index, array));
  }
  return mapped;
};

export const uuidV4 = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
