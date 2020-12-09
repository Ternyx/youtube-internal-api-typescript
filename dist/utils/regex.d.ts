interface RegexArrayOptions {
    returnOnFirstMatch?: boolean;
}
export declare function matchRegexes(target: string, regexes: RegExp[] | string[], options?: RegexArrayOptions): any;
interface ApplyRegexOptions {
    string: string;
    regex: RegExp;
    onError: () => never;
    matchIndex?: number;
}
export declare function applyRegex({ string, regex, onError, matchIndex }: ApplyRegexOptions): string;
export {};
