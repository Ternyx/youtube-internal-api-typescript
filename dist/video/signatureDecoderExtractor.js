"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureDecoderExtractionError = void 0;
const regex_1 = require("../utils/regex");
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
const signatureDecoder_1 = __importDefault(require("./signatureDecoder"));
class SignatureDecoderExtractionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SignatureDecoderExtractionError ';
    }
}
exports.SignatureDecoderExtractionError = SignatureDecoderExtractionError;
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
const CIPHER_FUNCTIONS = [
    [/\{\w\.reverse\(\)\}/, charArr => charArr.reverse()],
    [/\{\w\.splice\(0,\w\)\}/, (charArr, delCount) => {
            const doubleDelCount = delCount * 2;
            const end = doubleDelCount + (charArr.length - doubleDelCount);
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
class SignatureDecoderExtractor {
    constructor(options) {
        const { getBaseJs, functionPatterns, cipherFunctions, signatureDecodeCache } = Object.assign({}, {
            functionPatterns: FUNCTION_PATTERNS,
            cipherFunctions: CIPHER_FUNCTIONS,
            signatureDecodeCache: new Map()
        }, options);
        this.getBaseJs = getBaseJs;
        this.functionPatterns = functionPatterns;
        this.cipherFunctions = cipherFunctions;
        this.signatureDecodeCache = signatureDecodeCache;
    }
    ;
    getSignatureDecoder(baseJsUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.signatureDecodeCache.has(baseJsUrl)) {
                return this.signatureDecodeCache.get(baseJsUrl);
            }
            const baseJs = yield this.getBaseJs(baseJsUrl);
            const functionName = this.getSigFunctionName(baseJs);
            const transformMatch = baseJs.match(escape_string_regexp_1.default(functionName)
                + '=function\\(\\w\\)\\{[a-z=\\.\\(\\\\"\\)]*;(.*);(?:.+)\\}');
            if (transformMatch === null) {
                throw new SignatureDecoderExtractionError("Couldn't extract transformMatch functions");
            }
            const transformFunctions = transformMatch[1].split(';').map(func => (Object.assign({ var: func.split('.')[0] }, SignatureDecoderExtractor.extractFunctionNameAndArg(func))));
            const cipherFunctions = this.extractCipherFunctions(transformFunctions[0].var, baseJs);
            const signatureDecoder = new signatureDecoder_1.default(transformFunctions, cipherFunctions);
            this.signatureDecodeCache.set(baseJsUrl, signatureDecoder);
            return signatureDecoder;
        });
    }
    getSigFunctionName(baseJs) {
        const match = regex_1.matchRegexes(baseJs, this.functionPatterns, { returnOnFirstMatch: true });
        if (match === null) {
            throw new SignatureDecoderExtractionError("Couldn't extract signature function name");
        }
        return match[1].replace(/[^$A-Za-z0-9_]/g, '');
    }
    extractCipherFunctions(funcVar, js) {
        const replacedFuncVar = escape_string_regexp_1.default(funcVar.replace(/[^$A-Za-z0-9_]/g, ''));
        const match = js.match(new RegExp('var ' + replacedFuncVar + '=\\{(.*?)\\};', 's'));
        if (match) {
            const func = match[1].replace(/\n/g, ' ').split(", ");
            return Object.fromEntries(func.map(f => {
                const [name, jsFunction] = f.split(':', 2);
                return [name, this.getCipherFunction(jsFunction)];
            }));
        }
        console.debug(`Couldn't extract the the transformObject, funcvar:\n${funcVar}\njs:\n${js}`);
        throw new SignatureDecoderExtractionError("Couldn't extract the transform object ");
    }
    getCipherFunction(jsFunction) {
        for (let [regex, cipherFunction] of this.cipherFunctions) {
            if (jsFunction.match(regex)) {
                return cipherFunction;
            }
        }
        console.debug("No corresponding cipher function found for " + jsFunction);
        throw new Error("Can't find the corresponding cipher function");
    }
    static extractFunctionNameAndArg(jsFunction) {
        const match = jsFunction.match(/\w+\.(\w+)\(\w,(\d+)\)/);
        if (match) {
            return {
                name: match[1],
                arg: parseInt(match[2])
            };
        }
        throw new SignatureDecoderExtractionError("Couldn't extract the function name and/or arg");
    }
}
exports.default = SignatureDecoderExtractor;
