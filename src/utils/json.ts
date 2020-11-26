// start should point to the start of the JSON (i.e. '{'), othwerise there might be UB
export function findEndingJsonBracket(text: string, start = 0, end?: number): number {
    if (end === undefined) {
        end = text.length
    }

    let bracketCount = 0;
    let isPreviousEscape = false;
    let isWithinKeyOrValue = false;

    for (let i = start; i < end; i++) {
        const char = text.charAt(i);

        if (isPreviousEscape) { // we might be inside a unicode escape sequence, but we don't care
            isPreviousEscape = false; 
        } else if (!isWithinKeyOrValue) {
            switch (char) {
                case '}':
                    bracketCount--;
                    if (bracketCount == 0) {
                        return i; 
                    }
                    break;
                case '{':
                    bracketCount++;
                    break;
                case '"':
                    isWithinKeyOrValue = true;
                    break;
            }
        } else {
            switch (char) {
                case '"':
                    isWithinKeyOrValue = false;
                    break;
                case '\\':
                    isPreviousEscape = true;
                    break;
            }
        } 
    }

    return -1;
}
