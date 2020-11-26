import { matchRegexes } from '../utils/regex';
import escapeStringRegexp from 'escape-string-regexp';
import SignatureDecoder, { CipherFunction, CipherFunctionObj } from './signatureDecoder';

export class SignatureDecoderExtractionError extends Error {
    public name = 'SignatureDecoderExtractionError ';
    constructor(message: string) {
        super(message);
    }
}

export type GetBaseJs = (jsUrl: string) => Promise<string>

const FUNCTION_PATTERNS = [
    /\b[cs]\s*&&\s*[adf]\.set\([^,]+\s*,\s*encodeURIComponent\s*\(\s*([a-zA-Z0-9$]+)\(/,
    /\b[a-zA-Z0-9]+\s*&&\s*[a-zA-Z0-9]+\.set\([^,]+\s*,\s*encodeURIComponent\s*\(\s*([a-zA-Z0-9$]+)\(/,
    /(?:\b|[^a-zA-Z0-9$])([a-zA-Z0-9$]{2})\s*=\s*function\(\s*a\s*\)\s*\{\s*a\s*=\s*a\.split\(\s*\"\"\s*\)/, /([a-zA-Z0-9$]+)\s*=\s*function\(\s*a\s*\)\s*\{\s*a\s*=\s*a\.split\(\s*\"\"\s*\)/,
    /([\"'])signature\1\s*,\s*([a-zA-Z0-9$]+)\(/,
    /\.sig\|\|([a-zA-Z0-9$]+)\(/,
    /\b[cs]\s*&&\s*[adf]\.set\([^,]+\s*,\s*([a-zA-Z0-9$]+)\(/,
    /\b[a-zA-Z0-9]+\s*&&\s*[a-zA-Z0-9]+\.set\([^,]+\s*,\s*([a-zA-Z0-9$]+)\(/,
    /\bc\s*&&\s*a\.set\([^,]+\s*,\s*\([^)]*\)\s*\(\s*([a-zA-Z0-9$]+)\(/,
    /\bc\s*&&\s*[a-zA-Z0-9]+\.set\([^,]+\s*,\s*\([^)]*\)\s*\(\s*([a-zA-Z0-9$]+)\(/
];

const CIPHER_FUNCTIONS: Array<[RegExp, CipherFunction]> = [
    [/\{\w\.reverse\(\)\}/, charArr => charArr.reverse()],
    [/\{\w\.splice\(0,\w\)\}/, (charArr, delCount) => {
        const doubleDelCount = delCount * 2;
        const end = doubleDelCount + (charArr.length - doubleDelCount)

        return [...charArr.slice(0, delCount), ...charArr.slice(doubleDelCount, end)];
    }],
    [/\{var\s\w=\w\[0];\w\[0]=\w\[\w%\w.length];\w\[\w]=\w\}/, (charArr, pos) => {
        const c = charArr[0];

        charArr[0] = charArr[pos % charArr.length];
        charArr[pos] = c;
        return charArr;
    }],
    [/\{var\s\w=\w\[0];\w\[0]=\w\[\w%\w.length];\w\[\w%\w.length]=\w\}/, (charArr, pos) => {
        const c = charArr[0];
        const posMod = pos % charArr.length;

        charArr[0] = charArr[posMod];
        charArr[posMod] = c;
        return charArr;
    }]
];    

/**
 * Configuration options for `SignatureDecoderExtractor`
 *
 * @param getBaseJs - Function that gets called to obtain the base.js file
 * @param functionPatterns - List of function patterns that are used to find the function name transformFunctions
 * @param cipherFunctions - List of tuples containing the regex and the method for the corresponding cipher function
 * @param signatureDecodeCache - A map containing [baseJsUrl, SignatureDecoder] key/value pairs.
 */
export interface SignatureDecoderExtractorOptions {
    getBaseJs: GetBaseJs;
    functionPatterns?: RegExp[];
    cipherFunctions?: Array<[RegExp, CipherFunction]>;
    signatureDecodeCache?: Map<string, SignatureDecoder>;
}

export default class SignatureDecoderExtractor {
    private getBaseJs: GetBaseJs;
    private functionPatterns: RegExp[];
    private cipherFunctions: Array<[RegExp, CipherFunction]>;
    private signatureDecodeCache: Map<string, SignatureDecoder>;

    constructor(options: SignatureDecoderExtractorOptions) { 
        const { getBaseJs, functionPatterns, cipherFunctions, signatureDecodeCache } = Object.assign({}, {
            functionPatterns: FUNCTION_PATTERNS,
            cipherFunctions: CIPHER_FUNCTIONS,
            signatureDecodeCache: new Map<string, SignatureDecoder>()
        }, options)

        this.getBaseJs = getBaseJs;
        this.functionPatterns = functionPatterns;
        this.cipherFunctions = cipherFunctions;
        this.signatureDecodeCache = signatureDecodeCache;
    };

    async getSignatureDecoder(baseJsUrl: string) {
        if (this.signatureDecodeCache.has(baseJsUrl)) {
            return this.signatureDecodeCache.get(baseJsUrl);
        }

        const baseJs = await this.getBaseJs(baseJsUrl);
        const functionName = this.getSigFunctionName(baseJs);
        const transformMatch = baseJs.match(escapeStringRegexp(functionName) 
                                            + '=function\\(\\w\\)\\{[a-z=\\.\\(\\\\"\\)]*;(.*);(?:.+)\\}');

        if (transformMatch === null) {
            throw new SignatureDecoderExtractionError("Couldn't extract transformMatch functions");
        }

        const transformFunctions = transformMatch[1].split(';').map(func => ({
            var: func.split('.')[0],
            // name
            // arg
            ...SignatureDecoderExtractor.extractFunctionNameAndArg(func)
        }));

        const cipherFunctions = this.extractCipherFunctions(transformFunctions[0].var, baseJs);

        const signatureDecoder = new SignatureDecoder(transformFunctions, cipherFunctions);

        this.signatureDecodeCache.set(baseJsUrl, signatureDecoder);

        return signatureDecoder;
    }

    protected getSigFunctionName(baseJs: string) {
        const match = matchRegexes(baseJs, this.functionPatterns, { returnOnFirstMatch: true });
        if (match === null) {
            throw new SignatureDecoderExtractionError("Couldn't extract signature function name");
        }
        return match[1].replace(/[^$A-Za-z0-9_]/g, '');
    }


    protected extractCipherFunctions(funcVar: string, js: string): CipherFunctionObj {
        const replacedFuncVar = escapeStringRegexp(funcVar.replace(/[^$A-Za-z0-9_]/g, ''));

        const match = js.match(new RegExp('var ' + replacedFuncVar + '=\\{(.*?)\\};', 's'));
        
        if (match) {
            const func = match[1].replace(/\n/g, ' ').split(", ");

            return Object.fromEntries(func.map(f => {
                const [name, jsFunction] = f.split(':', 2);
                return [name, this.getCipherFunction(jsFunction)];
            }));
        }

        console.debug(`Couldn't extract the the transformObject, funcvar:\n${funcVar}\njs:\n${js}`)
        throw new SignatureDecoderExtractionError("Couldn't extract the transform object ");
    }

    protected getCipherFunction(jsFunction: string): CipherFunction {
        for (let [regex, cipherFunction] of this.cipherFunctions) {
            if (jsFunction.match(regex)) {
                return cipherFunction;
            }
        }

        console.debug("No corresponding cipher function found for " + jsFunction);
        throw new Error("Can't find the corresponding cipher function");
    }

    protected static extractFunctionNameAndArg(jsFunction: string): { name: string, arg: number } {
        const match = jsFunction.match(/\w+\.(\w+)\(\w,(\d+)\)/);
        if (match) {
            return {
                name: match[1],
                arg: parseInt(match[2])
            }
        }

        throw new SignatureDecoderExtractionError("Couldn't extract the function name and/or arg");
    }
}

