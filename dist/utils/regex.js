"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRegex = exports.matchRegexes = void 0;
function matchRegexes(target, regexes, options) {
    const { returnOnFirstMatch = false } = options;
    let hasSuccessfulMatch = false;
    let matches = [];
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
exports.matchRegexes = matchRegexes;
function applyRegex({ string, regex, onError, matchIndex = 1 }) {
    const match = string.match(regex);
    if (match !== null) {
        return match[matchIndex];
    }
    onError();
}
exports.applyRegex = applyRegex;
