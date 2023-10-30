export declare class ManagedBluelinkyError extends Error {
    readonly source?: Error | undefined;
    static ErrorName: string;
    constructor(message: string, source?: Error | undefined);
}
export interface Stringifiable {
    toString(): string;
}
export declare const manageBluelinkyError: (err: unknown, context?: string | undefined) => unknown | Error | ManagedBluelinkyError;
export declare const asyncMap: <T, U>(array: T[], callback: (item: T, i: number, items: T[]) => Promise<U>) => Promise<U[]>;
export declare const uuidV4: () => string;
