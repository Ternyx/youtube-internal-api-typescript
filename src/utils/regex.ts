interface RegexArrayOptions {
    returnOnFirstMatch?: boolean;
}

export function matchRegexes(target: string, regexes: RegExp[] | string[], options?: RegexArrayOptions): any {
    const { returnOnFirstMatch = false } = options;

    let hasSuccessfulMatch = false;
    let matches: (RegExpMatchArray|null)[] = [];

    for (let regex of regexes) {
        const match = target.match(regex);
        if (match !== null) {
            if (returnOnFirstMatch) {
                return match;
            }
            hasSuccessfulMatch = true;
        }
        matches.push(match);
    }

    if (!hasSuccessfulMatch) {
        return null;
    }

    return matches;
}

interface ApplyRegexOptions {
    string: string;
    regex: RegExp;
    onError: () => never;
    matchIndex?: number;
}

export function applyRegex({ string, regex, onError, matchIndex = 1 }: ApplyRegexOptions): string {
    const match = string.match(regex);

    if (match !== null) {
        return match[matchIndex];
    } 

    onError();
}
