import SignatureDecoder, { CipherFunction, CipherFunctionObj } from './signatureDecoder';
export declare class SignatureDecoderExtractionError extends Error {
    name: string;
    constructor(message: string);
}
export declare type GetBaseJs = (jsUrl: string) => Promise<string>;
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
    private getBaseJs;
    private functionPatterns;
    private cipherFunctions;
    private signatureDecodeCache;
    constructor(options: SignatureDecoderExtractorOptions);
    getSignatureDecoder(baseJsUrl: string): Promise<SignatureDecoder>;
    protected getSigFunctionName(baseJs: string): any;
    protected extractCipherFunctions(funcVar: string, js: string): CipherFunctionObj;
    protected getCipherFunction(jsFunction: string): CipherFunction;
    protected static extractFunctionNameAndArg(jsFunction: string): {
        name: string;
        arg: number;
    };
}
