interface RegexArrayOptions {
    returnOnFirstMatch?: boolean;
}

export function matchRegexes(target: string, regexes: RegExp[] | string[], options?: RegexArrayOptions): any {
    const { returnOnFirstMatch = false } = options;

    let matches: (RegExpMatchArray|null)[] = [];

    for (let regex of regexes) {
        const match = target.match(regex);
        if (match !== null && returnOnFirstMatch) {
            return match;
        }
        matches.push(match);
    }

    if (matches.length === 0) {
        return null;
    }

    return matches;
}
