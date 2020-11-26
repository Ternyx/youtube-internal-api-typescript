interface RegexArrayOptions {
    returnOnFirstMatch?: boolean;
}

export function matchRegexes(target: string, regexes: RegExp[] | string[], options?: RegexArrayOptions): any {
    const { returnOnFirstMatch = false } = options;

    let hasSuccesfulMatch = false;
    let matches: (RegExpMatchArray|null)[] = [];

    for (let regex of regexes) {
        const match = target.match(regex);
        if (match !== null) {
            if (returnOnFirstMatch) {
                return match;
            }
            hasSuccesfulMatch = true;
        }
        matches.push(match);
    }

    if (!hasSuccesfulMatch) {
        return null;
    }

    return matches;
}
